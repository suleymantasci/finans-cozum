"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toolsApi, UpdateToolDto, Tool, ToolCategory, ToolDataSourceType, ToolStatus } from '@/lib/tools-api'
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
import { ArrowLeft, Save, Loader2, Megaphone } from 'lucide-react'
import { toast } from 'sonner'
import { RequireAuth } from '@/components/auth/require-auth'
import Link from 'next/link'
import { getAvailableComponents } from '@/components/tools/registry'

function EditToolPageContent() {
  const router = useRouter()
  const params = useParams()
  const toolId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tool, setTool] = useState<Tool | null>(null)
  const [categories, setCategories] = useState<ToolCategory[]>([])
  const [availableComponents, setAvailableComponents] = useState<string[]>([])
  const [formData, setFormData] = useState<UpdateToolDto>({})

  useEffect(() => {
    if (toolId) {
      loadData()
    }
  }, [toolId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [toolData, categoriesData, components] = await Promise.all([
        toolsApi.getOne(toolId),
        toolsApi.getCategories(true),
        Promise.resolve(getAvailableComponents()),
      ])
      setTool(toolData)
      setCategories(categoriesData)
      setAvailableComponents(components)
      setFormData({
        name: toolData.name,
        slug: toolData.slug,
        description: toolData.description,
        status: toolData.status,
        component: toolData.component,
        icon: toolData.icon,
        color: toolData.color,
        bgColor: toolData.bgColor,
        order: toolData.order,
        isFeatured: toolData.isFeatured,
        dataSourceType: toolData.dataSourceType,
        dataSourceConfig: toolData.dataSourceConfig,
        config: toolData.config,
        metaTitle: toolData.metaTitle,
        metaDescription: toolData.metaDescription,
        keywords: toolData.keywords,
        categoryId: toolData.categoryId,
      })
    } catch (error: any) {
      console.error('Veriler yüklenemedi:', error)
      toast.error('Araç yüklenemedi')
      router.push('/admin/araclar')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await toolsApi.update(toolId, formData)
      toast.success('Araç başarıyla güncellendi')
      router.push('/admin/araclar')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Araç güncellenemedi'
      console.error('Araç güncelleme hatası:', error)
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

  if (!tool) {
    return null
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
            <h1 className="text-3xl font-bold">Araç Düzenle</h1>
            <p className="text-(--color-foreground-muted)">{tool.name}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Araç Adı *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="component">Component Adı *</Label>
              <Select
                value={formData.component || ''}
                onValueChange={(value) => setFormData({ ...formData, component: value })}
                required
              >
                <SelectTrigger id="component">
                  <SelectValue />
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
                <Label htmlFor="icon">Icon</Label>
                <Input
                  id="icon"
                  value={formData.icon || ''}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
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
                  value={formData.order || 0}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured || false}
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
                  <SelectItem value="STATIC">Statik</SelectItem>
                  <SelectItem value="DATABASE">Veritabanı</SelectItem>
                  <SelectItem value="EXTERNAL_API">Dış API</SelectItem>
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
                      // Invalid JSON
                    }
                  }}
                  rows={5}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Component Konfigürasyonu</CardTitle>
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
                    // Invalid JSON
                  }
                }}
                rows={8}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO & Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Başlık</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle || ''}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Açıklama</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription || ''}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Anahtar Kelimeler</Label>
              <Input
                id="keywords"
                value={formData.keywords?.join(', ') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

          <div className="flex justify-end gap-4">
            <Link href={`/admin/araclar/${toolId}/reklamlar`}>
              <Button type="button" variant="outline">
                <Megaphone className="mr-2 h-4 w-4" />
                Reklamları Yönet
              </Button>
            </Link>
            <Link href="/admin/araclar">
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

export default function EditToolPage() {
  return (
    <RequireAuth requireAdmin>
      <EditToolPageContent />
    </RequireAuth>
  )
}

