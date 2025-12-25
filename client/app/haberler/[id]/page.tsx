"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, User, Share2, ArrowRight, Calculator, TrendingUp, Bookmark, Send, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { newsApi, News } from "@/lib/news-api"
import { categoriesApi, Category } from "@/lib/categories-api"
import { newsAdsApi, NewsAdSlot } from "@/lib/news-ads-api"
import { NewsAdSlotDisplay } from "@/components/news/AdSlotDisplay"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { marketApi, MarketDataItem } from "@/lib/market-api"

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [article, setArticle] = useState<News | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [adSlots, setAdSlots] = useState<NewsAdSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [marketData, setMarketData] = useState<MarketDataItem[]>([])

  useEffect(() => {
    loadCategories()
    loadNews()
    loadAdSlots()
    loadMarketData()
    
    // Her 20 saniyede bir piyasa verilerini güncelle
    const interval = setInterval(loadMarketData, 20000)
    return () => clearInterval(interval)
  }, [resolvedParams.id])

  const loadAdSlots = async () => {
    try {
      const slots = await newsAdsApi.getActive()
      setAdSlots(slots)
    } catch (error) {
      console.error('Reklam alanları yüklenemedi:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getPublic()
      setCategories(data)
    } catch (error: any) {
      console.error('Kategoriler yüklenemedi:', error)
    }
  }

  const loadNews = async () => {
    try {
      const slugOrId = resolvedParams.id
      
      setIsLoading(true)
      const data = await newsApi.getOne(resolvedParams.id)
      setArticle(data)
    } catch (error: any) {
      toast.error(error.message || 'Haber yüklenemedi')
      router.push('/haberler')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMarketData = async () => {
    try {
      const response = await marketApi.getTickerData()
      setMarketData(response.items)
    } catch (error) {
      console.error('Piyasa verileri yüklenemedi:', error)
    }
  }

  const getItemBySymbol = (symbol: string): MarketDataItem | undefined => {
    return marketData.find(item => item.symbol === symbol || item.symbol.startsWith(symbol))
  }

  const formatPrice = (item: MarketDataItem | undefined) => {
    if (!item) return '--'
    
    if (item.category === 'crypto') {
      return item.price.toLocaleString('en-US', { maximumFractionDigits: 0 })
    } else if (item.category === 'forex') {
      return item.price.toLocaleString('tr-TR', { maximumFractionDigits: 4 })
    }
    return item.price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })
  }

  const formatChange = (item: MarketDataItem | undefined) => {
    if (!item) return '--'
    const sign = item.changePercent >= 0 ? '+' : ''
    return `${sign}${item.changePercent.toFixed(2)}%`
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

  const getTimeAgo = (date: string) => {
    const now = new Date()
    const newsDate = new Date(date)
    const diffInHours = Math.floor((now.getTime() - newsDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Az önce'
    if (diffInHours < 24) return `${diffInHours} saat önce`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} gün önce`
    return newsDate.toLocaleDateString('tr-TR')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

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

  // Reklam alanlarını pozisyonlara göre grupla
  const adSlotsByPosition = {
    SIDEBAR_LEFT: adSlots.filter((slot) => slot.position === 'SIDEBAR_LEFT'),
    SIDEBAR_RIGHT: adSlots.filter((slot) => slot.position === 'SIDEBAR_RIGHT'),
    AFTER_IMAGE: adSlots.filter((slot) => slot.position === 'AFTER_IMAGE'),
    IN_CONTENT: adSlots.filter((slot) => slot.position === 'IN_CONTENT'),
    BOTTOM: adSlots.filter((slot) => slot.position === 'BOTTOM'),
  }

  return (
    <div className="min-h-screen bg-(--color-background)">
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/haberler">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tüm Haberler
          </Link>
        </Button>

        <div className={`grid gap-8 ${adSlotsByPosition.SIDEBAR_LEFT.length > 0 ? 'lg:grid-cols-[280px_1fr_350px]' : 'lg:grid-cols-[1fr_350px]'}`}>
          {/* Sol Sidebar */}
          {adSlotsByPosition.SIDEBAR_LEFT.length > 0 && (
            <aside className="space-y-6">
              {adSlotsByPosition.SIDEBAR_LEFT.map((slot) => (
                <NewsAdSlotDisplay key={slot.id} slot={slot} />
              ))}
            </aside>
          )}

          <div className={`max-w-4xl ${adSlotsByPosition.SIDEBAR_LEFT.length === 0 ? 'lg:col-start-1' : ''}`}>
            <div className="mb-6">
              <Badge className="mb-4 text-sm">{getCategoryLabel(article)}</Badge>
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl text-balance">{article.title}</h1>
              <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-(--color-card) p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-primary)/10">
                    <User className="h-5 w-5 text-(--color-primary)" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{article.author.name || article.author.email}</p>
                    <p className="text-xs text-(--color-foreground-muted)">
                      {article.publishedAt ? getTimeAgo(article.publishedAt) : new Date(article.createdAt).toLocaleDateString('tr-TR')}
                    </p>
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
                      <DropdownMenuItem onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        toast.success('Link kopyalandı!')
                      }}>Linki Kopyala</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {article.featuredImage && (
              <div className="mb-8 overflow-hidden rounded-xl">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="aspect-video w-full object-cover"
                />
              </div>
            )}

            {/* AFTER_IMAGE Ad Slots */}
            {adSlotsByPosition.AFTER_IMAGE.length > 0 && (
              <div className="mb-8">
                {adSlotsByPosition.AFTER_IMAGE.map((slot) => (
                  <NewsAdSlotDisplay key={slot.id} slot={slot} />
                ))}
              </div>
            )}

            <div
              className="prose prose-lg max-w-none leading-relaxed dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* IN_CONTENT Ad Slots - içerik içinde */}
            {adSlotsByPosition.IN_CONTENT.length > 0 && (
              <div className="my-8">
                {adSlotsByPosition.IN_CONTENT.map((slot) => (
                  <NewsAdSlotDisplay key={slot.id} slot={slot} />
                ))}
              </div>
            )}

            {/* BOTTOM Ad Slots */}
            {adSlotsByPosition.BOTTOM.length > 0 && (
              <div className="mt-8">
                {adSlotsByPosition.BOTTOM.map((slot) => (
                  <NewsAdSlotDisplay key={slot.id} slot={slot} />
                ))}
              </div>
            )}

            {article.tags && article.tags.length > 0 && (
              <div className="mt-10 rounded-lg border bg-(--color-muted) p-6">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="text-sm font-medium">Etiketler:</span>
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
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
                      <DropdownMenuItem onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        toast.success('Link kopyalandı!')
                      }}>Linki Kopyala</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            {/* Sağ Sidebar Reklamları - En üstte */}
            {adSlotsByPosition.SIDEBAR_RIGHT.length > 0 && (
              <>
                {adSlotsByPosition.SIDEBAR_RIGHT.map((slot) => (
                  <NewsAdSlotDisplay key={slot.id} slot={slot} />
                ))}
              </>
            )}
            <div className="rounded-xl border bg-(--color-card) p-6">
              <h3 className="mb-4 text-xl font-bold">Popüler Araçlar</h3>
              <div className="space-y-3 flex flex-col">
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
                {(() => {
                  const usdTry = getItemBySymbol('USD/TRY')
                  const eurTry = getItemBySymbol('EUR/TRY')
                  const btc = getItemBySymbol('BTC')
                  const bist100 = marketData.find(item => item.name?.includes('BIST 100') || item.symbol === 'XU100')
                  
                  const items = [
                    { label: 'USD/TRY', item: usdTry },
                    { label: 'EUR/TRY', item: eurTry },
                    { label: 'BTC/USD', item: btc },
                    { label: 'BIST 100', item: bist100 },
                  ].filter(i => i.item) // Sadece bulunanları göster
                  
                  return items.length > 0 ? (
                    items.map(({ label, item }) => (
                      <div key={label} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="text-sm text-(--color-foreground-muted)">{label}</p>
                          <p className="font-bold">{formatPrice(item)}</p>
                        </div>
                        <span className={`text-sm font-medium ${item?.isUp ? 'text-green-600' : 'text-red-600'}`}>
                          {formatChange(item)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-(--color-foreground-muted)">
                      Piyasa verileri yükleniyor...
                    </div>
                  )
                })()}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
