import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Calculator, TrendingUp } from "lucide-react"

export const metadata: Metadata = {
  title: "Finans Haberleri | Finanscözüm",
  description: "En güncel ekonomi, döviz, borsa ve kripto para haberleri. Finans dünyasından son gelişmeler.",
  keywords: "finans haberleri, ekonomi haberleri, döviz haberleri, borsa haberleri, kripto para haberleri",
}

// Mock data - gerçek bir veritabanı veya API ile değiştirilecek
const newsArticles = [
  {
    id: 1,
    title: "Merkez Bankası Faiz Kararı Açıklandı",
    excerpt:
      "TCMB, politika faizini yüzde 50 seviyesinde sabit tutma kararı aldı. Piyasalar bu karara olumlu tepki verdi...",
    category: "Ekonomi",
    time: "2 saat önce",
    image: "/central-bank-building.jpg",
    author: "Ekonomi Editörü",
  },
  {
    id: 2,
    title: "Dolar ve Euro Kurunda Son Durum",
    excerpt: "Döviz piyasalarında hareketlilik devam ediyor. Dolar 34.25, Euro ise 37.82 seviyesinde işlem görüyor...",
    category: "Döviz",
    time: "4 saat önce",
    image: "/currency-exchange.png",
    author: "Piyasa Analisti",
  },
  {
    id: 3,
    title: "Kripto Para Piyasasında Yükseliş",
    excerpt: "Bitcoin 95 bin doları aşarken, altcoinlerde de hareketlilik gözleniyor. Ethereum %2.18 artış gösterdi...",
    category: "Kripto",
    time: "6 saat önce",
    image: "/cryptocurrency-chart.jpg",
    author: "Kripto Uzmanı",
  },
  {
    id: 4,
    title: "Bankalardan Kredi Faizlerinde İndirim",
    excerpt: "Özel bankalar konut ve taşıt kredisi faizlerinde yeni düzenlemelere gitti. İşte detaylar...",
    category: "Bankacılık",
    time: "8 saat önce",
    image: "/bank-building.jpg",
    author: "Finans Muhabiri",
  },
  {
    id: 5,
    title: "Altın Fiyatlarında Rekor Artış",
    excerpt: "Gram altın 2,845 TL seviyesine yükseldi. Uzmanlar yükselişin devam edeceğini öngörüyor...",
    category: "Emtia",
    time: "10 saat önce",
    image: "/gold-bars.jpg",
    author: "Emtia Analisti",
  },
  {
    id: 6,
    title: "BIST 100 Endeksinde Günün Kapanışı",
    excerpt: "Borsa İstanbul 9,856 puandan günü tamamladı. Sektör bazında en çok kazanan hisseler...",
    category: "Borsa",
    time: "12 saat önce",
    image: "/stock-market.jpg",
    author: "Borsa Editörü",
  },
]

const categories = ["Tümü", "Ekonomi", "Döviz", "Kripto", "Bankacılık", "Emtia", "Borsa"]

const popularTools = [
  {
    title: "Kredi Hesaplama",
    description: "Aylık taksit ve toplam maliyeti hesaplayın",
    icon: Calculator,
    href: "/araclar/kredi-hesaplama",
  },
  {
    title: "Döviz Çevirici",
    description: "Güncel kurlarla anlık dönüşüm",
    icon: TrendingUp,
    href: "/araclar/doviz-cevirici",
  },
]

const marketSummary = [
  { name: "USD/TRY", value: "34.25", change: "+0.12%", positive: true },
  { name: "EUR/TRY", value: "37.82", change: "+0.08%", positive: true },
  { name: "BTC/USD", value: "95,240", change: "+2.18%", positive: true },
  { name: "BIST 100", value: "9,856", change: "-0.34%", positive: false },
]

export default function NewsPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Finans Haberleri</h1>
          <p className="text-lg text-(--color-foreground-muted)">Finans dünyasından en güncel haberler ve analizler</p>
        </div>

        {/* Categories Filter */}
        <div className="mb-10 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === "Tümü" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
            >
              {category}
            </Badge>
          ))}
        </div>

        <div className="mb-12 overflow-hidden rounded-xl bg-gradient-to-br from-(--color-primary) to-(--color-accent) p-1">
          <div className="grid overflow-hidden rounded-lg bg-(--color-background) lg:grid-cols-[1.2fr_1fr]">
            <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
              <img
                src={newsArticles[0].image || "/placeholder.svg"}
                alt={newsArticles[0].title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <Badge className="absolute bottom-4 left-4 bg-white/90 text-black hover:bg-white">
                {newsArticles[0].category}
              </Badge>
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-10">
              <div className="mb-3 flex items-center gap-2 text-sm text-(--color-foreground-muted)">
                <Clock className="h-4 w-4" />
                {newsArticles[0].time}
              </div>
              <h2 className="mb-4 text-2xl font-bold lg:text-3xl">{newsArticles[0].title}</h2>
              <p className="mb-6 text-(--color-foreground-muted) leading-relaxed">{newsArticles[0].excerpt}</p>
              <Button asChild size="lg" className="w-fit">
                <Link href={`/haberler/${newsArticles[0].id}`}>
                  Haberi Oku
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-12 rounded-xl border bg-(--color-card) p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Canlı Piyasa Özeti</h2>
            <Button asChild variant="link">
              <Link href="/piyasalar">
                Tümünü Gör
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {marketSummary.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm text-(--color-foreground-muted)">{item.name}</p>
                  <p className="text-lg font-bold">{item.value}</p>
                </div>
                <span className={`text-sm font-medium ${item.positive ? "text-green-600" : "text-red-600"}`}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Son Haberler</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newsArticles.slice(1).map((article) => (
              <Card key={article.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
                <Link href={`/haberler/${article.id}`}>
                  <div className="relative aspect-[4/3] overflow-hidden sm:aspect-video">
                    <img
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <Badge className="absolute right-2 top-2 bg-white/90 text-black backdrop-blur-sm sm:right-3 sm:top-3">
                      {article.category}
                    </Badge>
                  </div>
                </Link>
                <CardHeader className="p-3 sm:p-6">
                  <div className="mb-1 flex items-center gap-1 text-xs text-(--color-foreground-muted)">
                    <Clock className="h-3 w-3" />
                    {article.time}
                  </div>
                  <CardTitle className="line-clamp-2 text-base leading-tight sm:text-lg">{article.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">{article.excerpt}</CardDescription>
                </CardHeader>
                <CardFooter className="p-3 pt-0 sm:p-6 sm:pt-0">
                  <Button asChild variant="ghost" size="sm" className="w-full justify-between text-sm">
                    <Link href={`/haberler/${article.id}`}>
                      Devamını Oku
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-12 rounded-xl bg-(--color-muted) p-8">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-2xl font-bold">Popüler Finans Araçları</h2>
            <p className="text-(--color-foreground-muted)">Finans hesaplamalarınızı kolayca yapın</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {popularTools.map((tool) => (
              <Card key={tool.title} className="group transition-all hover:shadow-lg">
                <Link href={tool.href}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="rounded-lg bg-(--color-primary)/10 p-3 transition-colors group-hover:bg-(--color-primary)/20">
                      <tool.icon className="h-6 w-6 text-(--color-primary)" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-1 text-lg">{tool.title}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </div>
                    <ArrowRight className="h-5 w-5 text-(--color-foreground-muted) transition-transform group-hover:translate-x-1" />
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button asChild size="lg">
              <Link href="/araclar">
                Tüm Araçları Keşfedin
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
