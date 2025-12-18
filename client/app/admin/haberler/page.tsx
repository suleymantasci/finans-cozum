import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Haber Yönetimi | Admin Panel",
  description: "Haberleri yönetin",
}

const news = [
  {
    id: 1,
    title: "Merkez Bankası Faiz Kararı Açıklandı",
    category: "Ekonomi",
    status: "Yayında",
    date: "18 Ara 2025",
    views: "1,245",
    author: "Ekonomi Editörü",
  },
  {
    id: 2,
    title: "Altın Fiyatları Rekor Kırdı",
    category: "Piyasalar",
    status: "Yayında",
    date: "17 Ara 2025",
    views: "892",
    author: "Piyasa Analisti",
  },
  {
    id: 3,
    title: "Borsa İstanbul Güne Yükselişle Başladı",
    category: "Borsa",
    status: "Taslak",
    date: "16 Ara 2025",
    views: "0",
    author: "Borsa Editörü",
  },
  {
    id: 4,
    title: "Kripto Para Piyasasında Hareketli Günler",
    category: "Kripto",
    status: "Yayında",
    date: "15 Ara 2025",
    views: "2,134",
    author: "Kripto Analisti",
  },
]

export default function AdminNewsPage() {
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
                <Input placeholder="Haber ara..." className="pl-10" />
              </div>
              <Button variant="outline">Filtrele</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {news.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="secondary">{item.category}</Badge>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          item.status === "Yayında"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-(--color-foreground-muted)">
                      <span>{item.author}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {item.views} görüntülenme
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/haberler/${item.id}`}>
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
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
