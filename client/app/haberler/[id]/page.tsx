import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, User, Share2, ArrowRight, Calculator, TrendingUp, Bookmark, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const newsArticles = [
  {
    id: 1,
    title: "Merkez Bankası Faiz Kararı Açıklandı",
    excerpt: "TCMB, politika faizini yüzde 50 seviyesinde sabit tutma kararı aldı.",
    category: "Ekonomi",
    time: "2 saat önce",
    image: "/central-bank-building.jpg",
    author: "Ekonomi Editörü",
    content: `
      <p>Türkiye Cumhuriyet Merkez Bankası (TCMB) Para Politikası Kurulu, politika faizini yüzde 50 seviyesinde sabit tutma kararı aldı.</p>
      
      <p>Kurul toplantısının ardından yapılan açıklamada, enflasyondaki düşüş eğiliminin sürdüğü ancak beklentilerin yakından takip edilmesi gerektiği vurgulandı.</p>
      
      <h2>Piyasa Tepkileri</h2>
      
      <p>Faiz kararının ardından döviz kurlarında sınırlı bir hareket gözlendi. Borsa İstanbul endeksi ise karara pozitif tepki verdi ve günü yüzde 0.8 artışla tamamladı.</p>
      
      <p>Ekonomi uzmanları, Merkez Bankası'nın kararlı duruşunu sürdürdüğünü ve enflasyonla mücadelede ısrarcı olduğunu değerlendiriyor.</p>
      
      <h2>Gelecek Dönem Beklentileri</h2>
      
      <p>Analistler, önümüzdeki aylarda enflasyon verilerinin seyrine göre Merkez Bankası'nın faiz politikasında değişikliğe gidebileceğini tahmin ediyor.</p>
      
      <p>Yılın ikinci yarısında faiz indirimlerinin başlayabileceği öngörülüyor.</p>
    `,
  },
]

const relatedTools = [
  {
    title: "Kredi Hesaplama",
    description: "Aylık taksit hesaplayın",
    icon: Calculator,
    href: "/araclar/kredi-hesaplama",
  },
  {
    title: "Döviz Çevirici",
    description: "Anlık kur dönüşümü",
    icon: TrendingUp,
    href: "/araclar/doviz-cevirici",
  },
]

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = newsArticles.find((a) => a.id === Number.parseInt(params.id))

  if (!article) {
    return {
      title: "Haber Bulunamadı | Finanscözüm",
    }
  }

  return {
    title: `${article.title} | Finanscözüm`,
    description: article.excerpt,
    keywords: `${article.category}, finans haberleri, ekonomi`,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  }
}

export default function NewsDetailPage({ params }: { params: { id: string } }) {
  const article = newsArticles.find((a) => a.id === Number.parseInt(params.id))

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold">Haber Bulunamadı</h1>
        <Button asChild>
          <Link href="/haberler">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Haberlere Dön
          </Link>
        </Button>
      </div>
    )
  }

  const relatedNews = newsArticles.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 3)

  const comments = [
    {
      id: 1,
      author: "Ahmet Yılmaz",
      time: "1 saat önce",
      content:
        "Merkez Bankası'nın kararlı duruşu piyasaları olumlu etkiliyor. Enflasyonla mücadelede başarılı olacağına inanıyorum.",
    },
    {
      id: 2,
      author: "Elif Demir",
      time: "3 saat önce",
      content: "Faiz kararı beklentiler doğrultusundaydı. Önümüzdeki aylarda indirim gelebilir.",
    },
  ]

  return (
    <div className="min-h-screen bg-(--color-background)">
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/haberler">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tüm Haberler
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div className="max-w-3xl">
            <div className="mb-6">
              <Badge className="mb-4 text-sm">{article.category}</Badge>
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl text-balance">{article.title}</h1>
              <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-(--color-card) p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-primary)/10">
                    <User className="h-5 w-5 text-(--color-primary)" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{article.author}</p>
                    <p className="text-xs text-(--color-foreground-muted)">{article.time}</p>
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Kaydet
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Share2 className="mr-2 h-4 w-4" />
                        Paylaş
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Twitter'da Paylaş</DropdownMenuItem>
                      <DropdownMenuItem>Facebook'ta Paylaş</DropdownMenuItem>
                      <DropdownMenuItem>WhatsApp'ta Paylaş</DropdownMenuItem>
                      <DropdownMenuItem>Linki Kopyala</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="mb-8 overflow-hidden rounded-xl">
              <img
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                className="aspect-video w-full object-cover"
              />
            </div>

            <div
              className="prose prose-lg max-w-none leading-relaxed dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className="mt-10 rounded-lg border bg-(--color-muted) p-6">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="text-sm font-medium">Etiketler:</span>
                <Badge variant="secondary">Merkez Bankası</Badge>
                <Badge variant="secondary">Faiz Oranları</Badge>
                <Badge variant="secondary">TCMB</Badge>
                <Badge variant="secondary">Ekonomi</Badge>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Kaydet
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Paylaş
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Twitter'da Paylaş</DropdownMenuItem>
                    <DropdownMenuItem>Facebook'ta Paylaş</DropdownMenuItem>
                    <DropdownMenuItem>WhatsApp'ta Paylaş</DropdownMenuItem>
                    <DropdownMenuItem>Linki Kopyala</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="mb-6 text-2xl font-bold">Yorumlar ({comments.length})</h2>

              <div className="mb-8 rounded-xl border bg-(--color-card) p-6">
                <h3 className="mb-4 font-semibold">Yorum Yap</h3>
                <div className="space-y-4">
                  <Input placeholder="Adınız" />
                  <Textarea placeholder="Yorumunuzu yazın..." rows={4} className="resize-none" />
                  <div className="flex justify-end">
                    <Button>
                      <Send className="mr-2 h-4 w-4" />
                      Yorum Gönder
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border bg-(--color-card) p-6">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-primary)/10">
                          <User className="h-5 w-5 text-(--color-primary)" />
                        </div>
                        <div>
                          <p className="font-medium">{comment.author}</p>
                          <p className="text-xs text-(--color-foreground-muted)">{comment.time}</p>
                        </div>
                      </div>
                    </div>
                    <p className="leading-relaxed text-(--color-foreground-muted)">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            {relatedNews.length > 0 && (
              <div className="rounded-xl border bg-(--color-card) p-6">
                <h3 className="mb-4 text-xl font-bold">İlgili Haberler</h3>
                <div className="space-y-4">
                  {relatedNews.map((news) => (
                    <Card key={news.id} className="group overflow-hidden transition-shadow hover:shadow-md">
                      <Link href={`/haberler/${news.id}`}>
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={news.image || "/placeholder.svg"}
                            alt={news.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <CardHeader className="p-4">
                          <CardTitle className="line-clamp-2 text-base leading-tight">{news.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            {news.time}
                          </CardDescription>
                        </CardHeader>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border bg-(--color-card) p-6">
              <h3 className="mb-4 text-xl font-bold">Popüler Araçlar</h3>
              <div className="space-y-3">
                {relatedTools.map((tool) => (
                  <Link key={tool.title} href={tool.href}>
                    <div className="group flex items-center gap-3 rounded-lg border bg-(--color-background) p-3 transition-all hover:border-(--color-primary) hover:shadow-md">
                      <div className="rounded-lg bg-(--color-primary)/10 p-2">
                        <tool.icon className="h-5 w-5 text-(--color-primary)" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{tool.title}</p>
                        <p className="text-xs text-(--color-foreground-muted)">{tool.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-(--color-foreground-muted) transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
              <Button asChild variant="outline" className="mt-4 w-full bg-transparent">
                <Link href="/araclar">
                  Tüm Araçlar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="overflow-hidden rounded-xl bg-gradient-to-br from-(--color-primary) to-(--color-accent) p-1">
              <div className="rounded-lg bg-(--color-card) p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-primary)/10">
                  <Calculator className="h-6 w-6 text-(--color-primary)" />
                </div>
                <h3 className="mb-2 text-lg font-bold">Finans Hesaplayıcı</h3>
                <p className="mb-4 text-sm text-(--color-foreground-muted)">
                  Kredi, faiz ve döviz hesaplamalarınızı kolayca yapın
                </p>
                <Button asChild className="w-full">
                  <Link href="/araclar">
                    Hemen Başla
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-xl border bg-(--color-card) p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Piyasa Özeti</h3>
                <Button asChild variant="link" size="sm" className="h-auto p-0">
                  <Link href="/piyasalar">Detay</Link>
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm text-(--color-foreground-muted)">USD/TRY</p>
                    <p className="font-bold">34.25</p>
                  </div>
                  <span className="text-sm font-medium text-green-600">+0.12%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm text-(--color-foreground-muted)">BTC/USD</p>
                    <p className="font-bold">95,240</p>
                  </div>
                  <span className="text-sm font-medium text-green-600">+2.18%</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
