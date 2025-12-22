"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { newsAdsApi, CreateNewsAdSlotDto, NewsAdSlotPosition } from '@/lib/news-ads-api'
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

function NewNewsAdSlotPageContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateNewsAdSlotDto>({
    position: 'TOP',
    isActive: true,
    order: 0,
    showOnMobile: true,
    showOnTablet: true,
    showOnDesktop: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await newsAdsApi.create(formData)
      toast.success('Reklam alanı başarıyla oluşturuldu')
      router.push('/admin/haber-reklamlari')
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
            <Link href="/admin/haber-reklamlari">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Reklam Alanlarına Dön
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Yeni Reklam Alanı</h1>
            <p className="text-(--color-foreground-muted)">Tüm haber sayfalarında gösterilecek reklam alanı ekleyin</p>
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
                  onValueChange={(value) => setFormData({ ...formData, position: value as NewsAdSlotPosition })}
                  required
                >
                  <SelectTrigger id="position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TOP">Üst (Liste Sayfası)</SelectItem>
                    <SelectItem value="BETWEEN_NEWS">Haberler Arası (Liste Sayfası)</SelectItem>
                    <SelectItem value="SIDEBAR_LEFT">Sol Sidebar (Detay Sayfası)</SelectItem>
                    <SelectItem value="SIDEBAR_RIGHT">Sağ Sidebar (Detay Sayfası)</SelectItem>
                    <SelectItem value="AFTER_IMAGE">Görsel Sonrası (Detay Sayfası)</SelectItem>
                    <SelectItem value="IN_CONTENT">İçerik İçinde (Detay Sayfası)</SelectItem>
                    <SelectItem value="BOTTOM">Alt (Her İki Sayfa)</SelectItem>
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
            <Link href="/admin/haber-reklamlari">
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

export default function NewNewsAdSlotPage() {
  return (
    <RequireAuth requireAdmin>
      <NewNewsAdSlotPageContent />
    </RequireAuth>
  )
}

