"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, FileText, Calendar, Users, TrendingUp, Plus } from "lucide-react"
import { RequireAuth } from "@/components/auth/require-auth"

const stats = [
  {
    title: "Toplam Haber",
    value: "245",
    change: "+12",
    icon: FileText,
    trend: "up",
  },
  {
    title: "Bu Ay Eklenen",
    value: "28",
    change: "+5",
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
    value: "1,284",
    change: "+45",
    icon: Users,
    trend: "up",
  },
]

const recentNews = [
  {
    id: 1,
    title: "Merkez Bankası Faiz Kararı Açıklandı",
    category: "Ekonomi",
    status: "Yayında",
    date: "18 Ara 2025",
  },
  {
    id: 2,
    title: "Altın Fiyatları Rekor Kırdı",
    category: "Piyasalar",
    status: "Yayında",
    date: "17 Ara 2025",
  },
  {
    id: 3,
    title: "Borsa İstanbul Güne Yükselişle Başladı",
    category: "Borsa",
    status: "Taslak",
    date: "16 Ara 2025",
  },
]

function AdminDashboardPageContent() {
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
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-(--color-foreground-muted)">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-(--color-foreground-muted)" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600">{stat.change} bu ay</p>
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
                {recentNews.map((news) => (
                  <div key={news.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex-1">
                      <p className="font-medium">{news.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-(--color-foreground-muted)">
                        <span>{news.category}</span>
                        <span>•</span>
                        <span>{news.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          news.status === "Yayında"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {news.status}
                      </span>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/haberler/${news.id}`}>Düzenle</Link>
                      </Button>
                    </div>
                  </div>
                ))}
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
