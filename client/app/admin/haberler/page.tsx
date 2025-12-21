"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, ArrowLeft, Loader2 } from "lucide-react"
import { newsApi, News, NewsStatus } from "@/lib/news-api"
import { categoriesApi, Category } from "@/lib/categories-api"
import { toast } from "sonner"
import { RequireAuth } from "@/components/auth/require-auth"
import { useRouter } from "next/navigation"

function AdminNewsPageContent() {
  const router = useRouter()
  const [news, setNews] = useState<News[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadCategories()
    loadNews()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll()
      setCategories(data)
    } catch (error: any) {
      console.error('Kategoriler yüklenemedi:', error)
    }
  }

  const loadNews = async () => {
    try {
      setIsLoading(true)
      const response = await newsApi.getAll()
      console.log('Haberler yüklendi:', response)
      setNews(response.items || [])
    } catch (error: any) {
      console.error('Haberler yüklenirken hata:', error)
      toast.error(error.message || 'Haberler yüklenemedi')
      setNews([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu haberi silmek istediğinize emin misiniz?')) {
      return
    }

    try {
      await newsApi.delete(id)
      toast.success('Haber başarıyla silindi')
      loadNews()
    } catch (error: any) {
      toast.error(error.message || 'Haber silinemedi')
    }
  }

  const getStatusBadge = (status: NewsStatus) => {
    const statusMap = {
      PUBLISHED: { label: 'Yayında', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      DRAFT: { label: 'Taslak', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      SCHEDULED: { label: 'Zamanlanmış', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    }
    const statusInfo = statusMap[status] || statusMap.DRAFT
    return (
      <span className={`rounded-full px-2 py-1 text-xs ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    )
  }

  const getCategoryLabel = (item: News) => {
    // Önce item.category objesinden name al, yoksa categoryId ile categories'den bul
    if (item.category && typeof item.category === 'object' && 'name' in item.category) {
      return item.category.name
    }
    if (item.categoryId) {
      const category = categories.find(c => c.id === item.categoryId)
      return category?.name || item.categoryId
    }
    return 'Kategori Yok'
  }

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-(--color-background)">
      <div className="border-b bg-(--color-card)">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard'a Dön
              </Link>
            </Button>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Haber Yönetimi</h1>
              <p className="text-(--color-foreground-muted)">Tüm haberlerinizi görüntüleyin ve yönetin</p>
            </div>
            <Button asChild size="lg">
              <Link href="/admin/haberler/yeni">
                <Plus className="mr-2 h-5 w-5" />
                Yeni Haber Ekle
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-foreground-muted)" />
                <Input
                  placeholder="Haber ara..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredNews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-(--color-foreground-muted)">Henüz haber eklenmemiş</p>
                <Button asChild className="mt-4">
                  <Link href="/admin/haberler/yeni">İlk Haberi Ekle</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredNews.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="secondary">{getCategoryLabel(item)}</Badge>
                        {getStatusBadge(item.status)}
                      </div>
                      <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-(--color-foreground-muted)">
                        <span>{item.author.name || item.author.email}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {item.views.toLocaleString('tr-TR')} görüntülenme
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/haberler/${item.slug}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Görüntüle
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/haberler/${item.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminNewsPage() {
  return (
    <RequireAuth requireAdmin>
      <AdminNewsPageContent />
    </RequireAuth>
  )
}
