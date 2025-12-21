"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { categoriesApi } from "@/lib/categories-api"
import { toast } from "sonner"
import { RequireAuth } from "@/components/auth/require-auth"
import { Switch } from "@/components/ui/switch"

function NewCategoryPageContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [order, setOrder] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name || name.trim() === '') {
      newErrors.name = 'Kategori adı zorunludur'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Lütfen tüm zorunlu alanları doldurun')
      return
    }

    setIsLoading(true)
    try {
      const data = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        isActive,
        order: order || 0,
      }

      await categoriesApi.create(data)
      toast.success('Kategori başarıyla oluşturuldu!')
      router.push('/admin/kategoriler')
    } catch (error: any) {
      toast.error(error.message || 'Kategori oluşturulamadı')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-(--color-background)">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin/kategoriler" className="mb-4 inline-flex items-center text-sm text-(--color-foreground-muted) hover:text-(--color-foreground)">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kategorilere Dön
          </Link>
          <h1 className="text-3xl font-bold">Yeni Kategori</h1>
          <p className="mt-2 text-(--color-foreground-muted)">
            Yeni bir haber kategorisi oluşturun
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Temel Bilgiler</CardTitle>
                  <CardDescription>Kategorinin temel bilgilerini girin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Kategori Adı *</Label>
                    <Input
                      id="name"
                      placeholder="Örn: Ekonomi"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        setErrors(prev => ({ ...prev, name: '' }))
                      }}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      placeholder="Otomatik oluşturulacak"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                    />
                    <p className="text-xs text-(--color-foreground-muted)">
                      Boş bırakılırsa kategori adından otomatik oluşturulur
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      placeholder="Kategori hakkında kısa bir açıklama"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ayarlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isActive">Aktif</Label>
                      <p className="text-sm text-(--color-foreground-muted)">
                        Kategori görünür ve kullanılabilir olacak
                      </p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order">Sıra</Label>
                    <Input
                      id="order"
                      type="number"
                      min="0"
                      value={order}
                      onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                    />
                    <p className="text-xs text-(--color-foreground-muted)">
                      Kategorilerin listelenme sırası (küçükten büyüğe)
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-4">
                    <Button className="w-full" type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Kaydet
                    </Button>
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/admin/kategoriler">İptal</Link>
                    </Button>
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

export default function NewCategoryPage() {
  return (
    <RequireAuth requireAdmin>
      <NewCategoryPageContent />
    </RequireAuth>
  )
}


