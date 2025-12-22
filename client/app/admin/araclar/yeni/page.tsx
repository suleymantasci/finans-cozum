"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toolsApi, CreateToolDto, ToolCategory, ToolDataSourceType, ToolStatus } from '@/lib/tools-api'
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
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { RequireAuth } from '@/components/auth/require-auth'
import Link from 'next/link'
import { getAvailableComponents } from '@/components/tools/registry'

function NewToolPageContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<ToolCategory[]>([])
  const [availableComponents, setAvailableComponents] = useState<string[]>([])
  const [formData, setFormData] = useState<CreateToolDto>({
    name: '',
    slug: '',
    description: '',
    status: 'DRAFT',
    component: '',
    icon: '',
    color: '',
    bgColor: '',
    order: 0,
    isFeatured: false,
    dataSourceType: 'STATIC',
    dataSourceConfig: {},
    config: {},
    metaTitle: '',
    metaDescription: '',
    keywords: [],
    categoryId: undefined,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [categoriesData, components] = await Promise.all([
        toolsApi.getCategories(true),
        Promise.resolve(getAvailableComponents()),
      ])
      setCategories(categoriesData)
      setAvailableComponents(components)
    } catch (error) {
      console.error('Veriler yüklenemedi:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await toolsApi.create(formData)
      toast.success('Araç başarıyla oluşturuldu')
      router.push('/admin/araclar')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Araç oluşturulamadı'
      console.error('Araç oluşturma hatası:', error)
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
            <Link href="/admin/araclar">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Araçlara Dön
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Yeni Araç</h1>
            <p className="text-(--color-foreground-muted)">Yeni bir finansal hesaplama aracı oluşturun</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
            <CardDescription>Araç hakkında temel bilgileri girin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Araç Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Örn: Kredi Hesaplama"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Otomatik oluşturulacak (boş bırakılabilir)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Araç hakkında kısa bir açıklama"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as ToolStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Taslak</SelectItem>
                    <SelectItem value="PUBLISHED">Yayında</SelectItem>
                    <SelectItem value="ARCHIVED">Arşivlendi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Kategori</Label>
                <Select
                  value={formData.categoryId || 'none'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value === 'none' ? undefined : value })
                  }
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kategori Yok</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Component & Görünüm</CardTitle>
            <CardDescription>Component adı ve görsel ayarları</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="component">Component Adı *</Label>
              <Select
                value={formData.component}
                onValueChange={(value) => setFormData({ ...formData, component: value })}
                required
              >
                <SelectTrigger id="component">
                  <SelectValue placeholder="Component seçin" />
                </SelectTrigger>
                <SelectContent>
                  {availableComponents.map((comp) => (
                    <SelectItem key={comp} value={comp}>
                      {comp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Lucide)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Calculator"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Renk</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color || '#000000'}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bgColor">Arka Plan Rengi</Label>
                <Input
                  id="bgColor"
                  type="color"
                  value={formData.bgColor || '#ffffff'}
                  onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Sıra</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">Öne Çıkan</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Veri Kaynağı</CardTitle>
            <CardDescription>Veri kaynağı tipini seçin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dataSourceType">Veri Kaynağı Tipi</Label>
              <Select
                value={formData.dataSourceType}
                onValueChange={(value) =>
                  setFormData({ ...formData, dataSourceType: value as ToolDataSourceType })
                }
              >
                <SelectTrigger id="dataSourceType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STATIC">Statik (Sadece client-side hesaplama)</SelectItem>
                  <SelectItem value="DATABASE">Veritabanı (DB'den veri çeken)</SelectItem>
                  <SelectItem value="EXTERNAL_API">Dış API (TCMB gibi)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(formData.dataSourceType === 'DATABASE' || formData.dataSourceType === 'EXTERNAL_API') && (
              <div className="space-y-2">
                <Label htmlFor="dataSourceConfig">Veri Kaynağı Konfigürasyonu (JSON)</Label>
                <Textarea
                  id="dataSourceConfig"
                  value={JSON.stringify(formData.dataSourceConfig || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      setFormData({
                        ...formData,
                        dataSourceConfig: JSON.parse(e.target.value),
                      })
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  rows={5}
                  placeholder='{"query": "...", "cache": 3600}'
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Component Konfigürasyonu</CardTitle>
            <CardDescription>Component'e özel ayarlar (JSON formatında)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="config">Config (JSON)</Label>
              <Textarea
                id="config"
                value={JSON.stringify(formData.config || {}, null, 2)}
                onChange={(e) => {
                  try {
                    setFormData({ ...formData, config: JSON.parse(e.target.value) })
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                rows={8}
                placeholder='{"defaultValues": {...}, "validation": {...}}'
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO & Metadata</CardTitle>
            <CardDescription>Arama motoru optimizasyonu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Başlık</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="SEO için başlık"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Açıklama</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                rows={3}
                placeholder="SEO için açıklama"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Anahtar Kelimeler (virgülle ayrılmış)</Label>
              <Input
                id="keywords"
                value={formData.keywords?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                  })
                }
                placeholder="kredi, hesaplama, taksit"
              />
            </div>
          </CardContent>
        </Card>

          <div className="flex justify-end gap-4">
            <Link href="/admin/araclar">
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

export default function NewToolPage() {
  return (
    <RequireAuth requireAdmin>
      <NewToolPageContent />
    </RequireAuth>
  )
}

