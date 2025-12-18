import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Clock } from "lucide-react"

const news = [
  {
    id: 1,
    title: "Merkez Bankası Faiz Kararı Açıklandı",
    excerpt: "TCMB, politika faizini yüzde 50 seviyesinde sabit tutma kararı aldı...",
    category: "Ekonomi",
    time: "2 saat önce",
    image: "/central-bank-building.jpg",
  },
  {
    id: 2,
    title: "Dolar ve Euro Kurunda Son Durum",
    excerpt: "Döviz piyasalarında hareketlilik devam ediyor. İşte detaylar...",
    category: "Döviz",
    time: "4 saat önce",
    image: "/currency-exchange.png",
  },
  {
    id: 3,
    title: "Kripto Para Piyasasında Yükseliş",
    excerpt: "Bitcoin 95 bin doları aşarken, altcoinlerde de hareketlilik gözleniyor...",
    category: "Kripto",
    time: "6 saat önce",
    image: "/cryptocurrency-chart.jpg",
  },
]

export function LatestNews() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Son Haberler</h2>
            <p className="text-lg text-(--color-foreground-muted)">Finans dünyasından güncel gelişmeler</p>
          </div>
          <Button asChild variant="outline" className="hidden md:flex bg-transparent">
            <Link href="/haberler">
              Tüm Haberler
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video relative overflow-hidden bg-(--color-muted)">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{item.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-(--color-foreground-muted)">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </span>
                </div>
                <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                <CardDescription className="line-clamp-2">{item.excerpt}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full">
                  <Link href={`/haberler/${item.id}`}>
                    Devamını Oku
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/haberler">
              Tüm Haberler
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
