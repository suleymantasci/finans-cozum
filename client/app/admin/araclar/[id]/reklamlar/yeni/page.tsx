"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toolsApi, CreateAdSlotDto, AdSlotTemplate, AdSlotPosition } from '@/lib/tools-api'
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

function NewAdSlotPageContent() {
  const params = useParams()
  const router = useRouter()
  const toolId = params.id as string
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<AdSlotTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('none')
  const [formData, setFormData] = useState<CreateAdSlotDto>({
    toolId,
    position: 'TOP',
    isActive: true,
    order: 0,
    showOnMobile: true,
    showOnTablet: true,
    showOnDesktop: true,
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    if (selectedTemplate !== 'none') {
      const template = templates.find((t) => t.id === selectedTemplate)
      if (template) {
        setFormData({
          ...formData,
          templateId: template.id,
          position: template.position,
          content: template.content,
          scriptUrl: template.scriptUrl,
          imageUrl: template.imageUrl,
          linkUrl: template.linkUrl,
          showOnMobile: template.showOnMobile,
          showOnTablet: template.showOnTablet,
          showOnDesktop: template.showOnDesktop,
          startDate: template.startDate,
          endDate: template.endDate,
        })
      }
    } else {
      setFormData({
        ...formData,
        templateId: undefined,
      })
    }
  }, [selectedTemplate])

  const loadTemplates = async () => {
    try {
      const data = await toolsApi.getTemplates()
      setTemplates(data)
    } catch (error) {
      console.error('Şablonlar yüklenemedi:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await toolsApi.createAdSlot(formData)
      toast.success('Reklam alanı başarıyla oluşturuldu')
      router.push(`/admin/araclar/${toolId}/reklamlar`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Reklam alanı oluşturulamadı'
      console.error('Reklam alanı oluşturma hatası:', error)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-3xl font-bold">Yeni Reklam Alanı</h1>
            <p className="text-(--color-foreground-muted)">Araç sayfasına yeni bir reklam alanı ekleyin</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Şablon Kullan (Opsiyonel)</CardTitle>
              <CardDescription>
                Mevcut bir reklam şablonunu kullanarak hızlıca reklam alanı oluşturabilirsiniz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="template">Şablon Seç</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Şablon seçin (opsiyonel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Şablon Kullanma</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.position})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

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
                    <SelectItem value="TOP">Üst (Sayfanın en üstünde)</SelectItem>
                    <SelectItem value="SIDEBAR_LEFT">Sol Sidebar</SelectItem>
                    <SelectItem value="SIDEBAR_RIGHT">Sağ Sidebar</SelectItem>
                    <SelectItem value="MIDDLE">Orta (Component'ten sonra)</SelectItem>
                    <SelectItem value="BOTTOM">Alt (Sayfanın en altında)</SelectItem>
                    <SelectItem value="INLINE">Satır İçi (Component içinde)</SelectItem>
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
              <CardDescription>
                Google Ads script'i, HTML içerik veya görsel reklam ekleyebilirsiniz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">HTML/JavaScript İçerik</Label>
                <Textarea
                  id="content"
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  placeholder="Google Ads script'i veya HTML içerik buraya yapıştırın"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scriptUrl">Script URL</Label>
                <Input
                  id="scriptUrl"
                  value={formData.scriptUrl || ''}
                  onChange={(e) => setFormData({ ...formData, scriptUrl: e.target.value })}
                  placeholder="https://example.com/script.js"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Görsel URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkUrl">Link URL</Label>
                  <Input
                    id="linkUrl"
                    value={formData.linkUrl || ''}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="https://example.com"
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
              <CardTitle>Tarih Aralığı (Opsiyonel)</CardTitle>
              <CardDescription>
                Reklamın gösterileceği tarih aralığını belirleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Bitiş Tarihi</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate || ''}
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
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Oluşturuluyor...' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewAdSlotPage() {
  return (
    <RequireAuth requireAdmin>
      <NewAdSlotPageContent />
    </RequireAuth>
  )
}

