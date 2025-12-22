"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, FileText, Calendar, Users, TrendingUp, Plus, Loader2, FolderTree, Calculator, Megaphone } from "lucide-react"
import { RequireAuth } from "@/components/auth/require-auth"
import { newsApi, News, NewsStats } from "@/lib/news-api"
import { categoriesApi, Category } from "@/lib/categories-api"
import { usersApi, UserStats } from "@/lib/users-api"
import { toast } from "sonner"

function AdminDashboardPageContent() {
  const [stats, setStats] = useState<NewsStats | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [recentNews, setRecentNews] = useState<News[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCategories()
    loadData()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll()
      setCategories(data)
    } catch (error: any) {
      console.error('Kategoriler yüklenemedi:', error)
    }
  }

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [statsData, newsData, userStatsData] = await Promise.all([
        newsApi.getStats(),
        newsApi.getAll(undefined, undefined, 3, 0),
        usersApi.getStats(),
      ])
      setStats(statsData)
      setUserStats(userStatsData)
      setRecentNews(newsData.items)
    } catch (error: any) {
      toast.error(error.message || 'Veriler yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryLabel = (item: News) => {
    // Önce item.category objesinden name al
    if (item.category && typeof item.category === 'object' && 'name' in item.category) {
      return item.category.name
    }
    // Yoksa categoryId ile categories'den bul
    if (item.categoryId) {
      const category = categories.find(c => c.id === item.categoryId)
      return category?.name || item.categoryId
    }
    return 'Kategori Yok'
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PUBLISHED: 'Yayında',
      DRAFT: 'Taslak',
      SCHEDULED: 'Zamanlanmış',
    }
    return statusMap[status] || status
  }

  const displayStats = [
    {
      title: "Toplam Haber",
      value: stats?.total.toString() || "0",
      change: stats ? `+${stats.thisMonth}` : "+0",
      icon: FileText,
      trend: "up",
    },
    {
      title: "Bu Ay Eklenen",
      value: stats?.thisMonth.toString() || "0",
      change: stats?.thisMonth ? `+${stats.thisMonth}` : "+0",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Takvim Etkinlikleri",
      value: "156",
      change: "+23",
      icon: Calendar,
      trend: "up",
    },
    {
      title: "Toplam Kullanıcı",
      value: userStats?.total.toLocaleString('tr-TR') || "0",
      change: userStats?.change ? (userStats.change >= 0 ? `+${userStats.change}` : `${userStats.change}`) : "+0",
      icon: Users,
      trend: userStats?.change && userStats.change >= 0 ? "up" : "down",
    },
  ]

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-(--color-foreground-muted)">Hoş geldiniz, içerik yönetimi</p>
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
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {displayStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-(--color-foreground-muted)">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-(--color-foreground-muted)" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <p className={`text-xs ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {stat.change}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Son Haberler</CardTitle>
              <CardDescription>En son eklenen ve düzenlenen haberler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentNews.length === 0 ? (
                  <p className="text-center text-(--color-foreground-muted)">Henüz haber eklenmemiş</p>
                ) : (
                  recentNews.map((news) => (
                    <div key={news.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex-1">
                        <p className="font-medium">{news.title}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-(--color-foreground-muted)">
                          <span>{getCategoryLabel(news)}</span>
                          <span>•</span>
                          <span>{new Date(news.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            news.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {getStatusLabel(news.status)}
                        </span>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/haberler/${news.id}`}>Düzenle</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button asChild variant="outline" className="mt-4 w-full bg-transparent">
                <Link href="/admin/haberler">Tüm Haberleri Görüntüle</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hızlı Erişim</CardTitle>
              <CardDescription>Sık kullanılan yönetim araçları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start bg-transparent" size="lg">
                <Link href="/admin/haberler">
                  <FileText className="mr-3 h-5 w-5" />
                  Haber Yönetimi
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent" size="lg">
                <Link href="/admin/kategoriler">
                  <FolderTree className="mr-3 h-5 w-5" />
                  Kategori Yönetimi
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent" size="lg">
                <Link href="/admin/araclar">
                  <Calculator className="mr-3 h-5 w-5" />
                  Araç Yönetimi
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent" size="lg">
                <Link href="/admin/reklam-sablonlari">
                  <Megaphone className="mr-3 h-5 w-5" />
                  Reklam Şablonları
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent" size="lg">
                <Link href="/admin/haber-reklamlari">
                  <Megaphone className="mr-3 h-5 w-5" />
                  Haber Reklamları
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent" size="lg">
                <Link href="/admin/takvimler">
                  <Calendar className="mr-3 h-5 w-5" />
                  Takvim Yönetimi
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent" size="lg">
                <Link href="/admin/kullanicilar">
                  <Users className="mr-3 h-5 w-5" />
                  Kullanıcı Yönetimi
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent" size="lg">
                <Link href="/admin/analizler">
                  <BarChart3 className="mr-3 h-5 w-5" />
                  İstatistikler ve Analizler
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <RequireAuth requireAdmin>
      <AdminDashboardPageContent />
    </RequireAuth>
  )
}
