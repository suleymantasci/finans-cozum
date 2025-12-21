"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Save, Eye, Loader2 } from "lucide-react"
import { useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { newsApi, NewsStatus } from "@/lib/news-api"
import { categoriesApi, Category } from "@/lib/categories-api"
import { toast } from "sonner"
import { RequireAuth } from "@/components/auth/require-auth"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { useEffect } from "react"

function NewNewsPageContent() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [image, setImage] = useState("")
  const [status, setStatus] = useState<NewsStatus>("DRAFT")
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [publishedAt, setPublishedAt] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true)
      const data = await categoriesApi.getAll()
      setCategories(data)
    } catch (error: any) {
      toast.error(error.message || 'Kategoriler yüklenemedi')
    } finally {
      setCategoriesLoading(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const result = await newsApi.uploadImage(file)
      setImage(result.url)
      toast.success('Görsel başarıyla yüklendi')
    } catch (error: any) {
      toast.error(error.message || 'Görsel yüklenemedi')
    } finally {
      setIsUploading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title || title.trim() === '') {
      newErrors.title = 'Başlık zorunludur'
    }

    if (!content || content.trim() === '') {
      newErrors.content = 'İçerik zorunludur'
    }

    if (!categoryId || categoryId === '') {
      newErrors.categoryId = 'Kategori seçilmelidir'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Lütfen tüm zorunlu alanları doldurun')
      // İlk hataya scroll yap
      const firstErrorField = Object.keys(errors)[0]
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsLoading(true)
    try {
      const data = {
        title: title.trim(),
        excerpt: excerpt?.trim() || undefined,
        content: content.trim(),
        categoryId,
        status,
        featuredImage: image?.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        metaTitle: metaTitle?.trim() || undefined,
        metaDescription: metaDescription?.trim() || undefined,
        publishedAt: publishedAt || undefined,
      }

      await newsApi.create(data)
      toast.success('Haber başarıyla oluşturuldu!')
      router.push('/admin/haberler')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Haber oluşturulamadı'
      toast.error(errorMessage)
      console.error('Create error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-(--color-background)">
      <div className="border-b bg-(--color-card)">
        <div className="container mx-auto px-4 py-6">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/admin/haberler">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Haberlere Dön
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Yeni Haber Ekle</h1>
              <p className="text-(--color-foreground-muted)">Yeni bir haber içeriği oluşturun</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Temel Bilgiler</CardTitle>
                  <CardDescription>Haberin temel bilgilerini girin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Başlık *</Label>
                    <Input
                      id="title"
                      placeholder="Haber başlığını girin"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value)
                        if (errors.title) {
                          setErrors(prev => ({ ...prev, title: '' }))
                        }
                      }}
                      className={errors.title ? 'border-red-500' : ''}
                      required
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Özet</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Kısa bir özet yazın"
                      rows={3}
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Kategori *</Label>
                    <Select 
                      value={categoryId} 
                      onValueChange={(value) => {
                        setCategoryId(value)
                        if (errors.categoryId) {
                          setErrors(prev => ({ ...prev, categoryId: '' }))
                        }
                      }}
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={categoriesLoading ? "Yükleniyor..." : "Kategori seçin"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.categoryId && (
                      <p className="text-sm text-red-500">{errors.categoryId}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Görsel</CardTitle>
                  <CardDescription>Haberin kapak görselini yükleyin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {image && (
                    <div className="overflow-hidden rounded-lg border">
                      <img src={image} alt="Preview" className="aspect-video w-full object-cover" />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors hover:border-(--color-primary)"
                  >
                    <div className="text-center">
                      {isUploading ? (
                        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-(--color-primary)" />
                      ) : (
                        <Upload className="mx-auto mb-4 h-12 w-12 text-(--color-foreground-muted)" />
                      )}
                      <p className="mb-2 text-sm font-medium">
                        {isUploading ? 'Yükleniyor...' : 'Görsel yüklemek için tıklayın'}
                      </p>
                      <p className="text-xs text-(--color-foreground-muted)">PNG, JPG veya WEBP (max. 5MB)</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">veya Görsel URL'si</Label>
                    <Input
                      id="imageUrl"
                      placeholder="https://example.com/image.jpg"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>İçerik *</CardTitle>
                  <CardDescription>Haberin tam içeriğini yazın. Görsel ve video ekleyebilirsiniz.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    value={content}
                    onChange={(value) => {
                      setContent(value)
                      if (errors.content) {
                        setErrors(prev => ({ ...prev, content: '' }))
                      }
                    }}
                    placeholder="İçeriğinizi buraya yazın..."
                    error={errors.content}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Etiketler</CardTitle>
                  <CardDescription>İçeriğinizle ilgili etiketler ekleyin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Etiket ekle..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag}>
                      Ekle
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Yayınlama</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Durum</Label>
                    <Select value={status} onValueChange={(value) => setStatus(value as NewsStatus)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Taslak</SelectItem>
                        <SelectItem value="PUBLISHED">Yayınla</SelectItem>
                        <SelectItem value="SCHEDULED">Zamanla</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Yayın Tarihi</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={publishedAt}
                      onChange={(e) => setPublishedAt(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Kaydet
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO</CardTitle>
                  <CardDescription>Arama motoru optimizasyonu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Başlık</Label>
                    <Input
                      id="metaTitle"
                      placeholder="SEO başlığı"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                    />
                    <p className="text-xs text-(--color-foreground-muted)">Önerilen: 50-60 karakter</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Açıklama</Label>
                    <Textarea
                      id="metaDescription"
                      placeholder="SEO açıklaması"
                      rows={3}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                    />
                    <p className="text-xs text-(--color-foreground-muted)">Önerilen: 150-160 karakter</p>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewNewsPage() {
  return (
    <RequireAuth requireAdmin>
      <NewNewsPageContent />
    </RequireAuth>
  )
}
