"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Save, Eye } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

export default function NewNewsPage() {
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [image, setImage] = useState("")

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
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
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Özet *</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Kısa bir özet yazın"
                    rows={3}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ekonomi">Ekonomi</SelectItem>
                      <SelectItem value="piyasalar">Piyasalar</SelectItem>
                      <SelectItem value="borsa">Borsa</SelectItem>
                      <SelectItem value="kripto">Kripto</SelectItem>
                      <SelectItem value="bankalar">Bankalar</SelectItem>
                      <SelectItem value="finans">Finans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Görsel</CardTitle>
                <CardDescription>Haberin kapak görselini yükleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors hover:border-(--color-primary)">
                  <div className="text-center">
                    <Upload className="mx-auto mb-4 h-12 w-12 text-(--color-foreground-muted)" />
                    <p className="mb-2 text-sm font-medium">Görsel yüklemek için tıklayın</p>
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
                <CardTitle>İçerik</CardTitle>
                <CardDescription>Haberin tam içeriğini yazın</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Haber içeriğini buraya yazın..."
                  rows={15}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="resize-none font-mono"
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
                  <Select defaultValue="draft">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Taslak</SelectItem>
                      <SelectItem value="published">Yayınla</SelectItem>
                      <SelectItem value="scheduled">Zamanla</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Yazar</Label>
                  <Input id="author" placeholder="Yazar adı" defaultValue="Admin" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Yayın Tarihi</Label>
                  <Input id="date" type="datetime-local" />
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <Button className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Kaydet
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Eye className="mr-2 h-4 w-4" />
                    Önizle
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
                  <Input id="metaTitle" placeholder="SEO başlığı" />
                  <p className="text-xs text-(--color-foreground-muted)">Önerilen: 50-60 karakter</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Açıklama</Label>
                  <Textarea id="metaDescription" placeholder="SEO açıklaması" rows={3} />
                  <p className="text-xs text-(--color-foreground-muted)">Önerilen: 150-160 karakter</p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
