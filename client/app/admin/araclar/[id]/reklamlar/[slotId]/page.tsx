"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toolsApi, ToolAdSlot, AdSlotTemplate, AdSlotPosition, CreateAdSlotDto } from '@/lib/tools-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { RequireAuth } from '@/components/auth/require-auth'

function EditAdSlotPageContent() {
  const params = useParams()
  const router = useRouter()
  const toolId = params.id as string
  const slotId = params.slotId as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [slot, setSlot] = useState<ToolAdSlot | null>(null)
  const [templates, setTemplates] = useState<AdSlotTemplate[]>([])
  const [formData, setFormData] = useState<Partial<CreateAdSlotDto>>({})

  useEffect(() => {
    loadData()
  }, [slotId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [slotData, templatesData] = await Promise.all([
        toolsApi.getAdSlots(toolId).then((slots) => slots.find((s) => s.id === slotId)),
        toolsApi.getTemplates(),
      ])
      if (!slotData) {
        toast.error('Reklam alanı bulunamadı')
        router.push(`/admin/araclar/${toolId}/reklamlar`)
        return
      }
      setSlot(slotData)
      setTemplates(templatesData)
      setFormData({
        position: slotData.position,
        isActive: slotData.isActive,
        order: slotData.order,
        content: slotData.content,
        scriptUrl: slotData.scriptUrl,
        imageUrl: slotData.imageUrl,
        linkUrl: slotData.linkUrl,
        showOnMobile: slotData.showOnMobile,
        showOnTablet: slotData.showOnTablet,
        showOnDesktop: slotData.showOnDesktop,
        startDate: slotData.startDate,
        endDate: slotData.endDate,
        templateId: slotData.templateId,
      })
    } catch (error: any) {
      console.error('Veriler yüklenemedi:', error)
      toast.error('Reklam alanı yüklenemedi')
      router.push(`/admin/araclar/${toolId}/reklamlar`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await toolsApi.updateAdSlot(slotId, formData)
      toast.success('Reklam alanı başarıyla güncellendi')
      router.push(`/admin/araclar/${toolId}/reklamlar`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Reklam alanı güncellenemedi'
      console.error('Reklam alanı güncelleme hatası:', error)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!slot) {
    return null
  }

  return (
    <div className="min-h-screen bg-(--color-background)">
      <div className="border-b bg-(--color-card)">
        <div className="container mx-auto px-4 py-6">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href={`/admin/araclar/${toolId}/reklamlar`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Reklam Alanlarına Dön
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Reklam Alanı Düzenle</h1>
            <p className="text-(--color-foreground-muted)">Reklam alanı ayarlarını güncelleyin</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Temel Ayarlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="position">Pozisyon *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value as AdSlotPosition })}
                  required
                >
                  <SelectTrigger id="position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TOP">Üst</SelectItem>
                    <SelectItem value="SIDEBAR_LEFT">Sol Sidebar</SelectItem>
                    <SelectItem value="SIDEBAR_RIGHT">Sağ Sidebar</SelectItem>
                    <SelectItem value="MIDDLE">Orta</SelectItem>
                    <SelectItem value="BOTTOM">Alt</SelectItem>
                    <SelectItem value="INLINE">Satır İçi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Sıra</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order || 0}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium">Aktif</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reklam İçeriği</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">HTML/JavaScript İçerik</Label>
                <Textarea
                  id="content"
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scriptUrl">Script URL</Label>
                <Input
                  id="scriptUrl"
                  value={formData.scriptUrl || ''}
                  onChange={(e) => setFormData({ ...formData, scriptUrl: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Görsel URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkUrl">Link URL</Label>
                  <Input
                    id="linkUrl"
                    value={formData.linkUrl || ''}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Görünürlük Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showOnMobile ?? true}
                    onChange={(e) => setFormData({ ...formData, showOnMobile: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">Mobil cihazlarda göster</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showOnTablet ?? true}
                    onChange={(e) => setFormData({ ...formData, showOnTablet: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">Tablet cihazlarda göster</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showOnDesktop ?? true}
                    onChange={(e) => setFormData({ ...formData, showOnDesktop: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">Desktop cihazlarda göster</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tarih Aralığı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Bitiş Tarihi</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href={`/admin/araclar/${toolId}/reklamlar`}>
              <Button type="button" variant="outline">
                İptal
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EditAdSlotPage() {
  return (
    <RequireAuth requireAdmin>
      <EditAdSlotPageContent />
    </RequireAuth>
  )
}

