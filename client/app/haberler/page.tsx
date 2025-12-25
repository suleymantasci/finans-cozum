"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Calculator, TrendingUp, Loader2 } from "lucide-react"
import { newsApi, News } from "@/lib/news-api"
import { categoriesApi, Category } from "@/lib/categories-api"
import { newsAdsApi, NewsAdSlot } from "@/lib/news-ads-api"
import { NewsAdSlotDisplay } from "@/components/news/AdSlotDisplay"
import { toast } from "sonner"
import { marketApi, MarketDataItem } from "@/lib/market-api"


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


export default function NewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [adSlots, setAdSlots] = useState<NewsAdSlot[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü")
  const [isLoading, setIsLoading] = useState(true)
  const [marketData, setMarketData] = useState<MarketDataItem[]>([])

  useEffect(() => {
    loadCategories()
    loadAdSlots()
    loadMarketData()
    
    // Her 20 saniyede bir piyasa verilerini güncelle
    const interval = setInterval(loadMarketData, 20000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadNews()
  }, [selectedCategory])

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
      setIsLoading(true)
      const categoryId = selectedCategory === "Tümü" ? undefined : selectedCategory
      const response = await newsApi.getPublished(categoryId, 20)
      setNews(response.items)
    } catch (error: any) {
      toast.error(error.message || 'Haberler yüklenemedi')
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

  const featuredNews = news[0]
  const otherNews = news.slice(1)

  // Reklam alanlarını pozisyonlara göre grupla
  const adSlotsByPosition = {
    TOP: adSlots.filter((slot) => slot.position === 'TOP'),
    BETWEEN_NEWS: adSlots.filter((slot) => slot.position === 'BETWEEN_NEWS'),
    BOTTOM: adSlots.filter((slot) => slot.position === 'BOTTOM'),
  }

  // BETWEEN_NEWS reklamları için gösterim sırası: 3, 8, 20, 35, 50...
  const getAdPositions = (totalAds: number) => {
    const positions: number[] = []
    if (totalAds >= 1) positions.push(3)
    if (totalAds >= 2) positions.push(8)
    if (totalAds >= 3) positions.push(20)
    if (totalAds >= 4) positions.push(35)
    if (totalAds >= 5) positions.push(50)
    // Daha fazla reklam varsa her 20'de bir ekle
    for (let i = 6; i <= totalAds; i++) {
      positions.push(20 + (i - 3) * 15)
    }
    return positions
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* TOP Ad Slots */}
        {adSlotsByPosition.TOP.length > 0 && (
          <div className="mb-6">
            {adSlotsByPosition.TOP.map((slot) => (
              <NewsAdSlotDisplay key={slot.id} slot={slot} />
            ))}
          </div>
        )}

        <div className="mb-10">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Finans Haberleri</h1>
          <p className="text-lg text-(--color-foreground-muted)">Finans dünyasından en güncel haberler ve analizler</p>
        </div>

        {/* Categories Filter */}
        <div className="mb-10 flex flex-wrap gap-2">
          <Badge
            key="Tümü"
            variant={selectedCategory === "Tümü" ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
            onClick={() => setSelectedCategory("Tümü")}
          >
            Tümü
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Badge>
          ))}
        </div>

        {featuredNews && (
          <div className="mb-12 overflow-hidden rounded-xl bg-gradient-to-br from-(--color-primary) to-(--color-accent) p-1">
            <div className="grid overflow-hidden rounded-lg bg-(--color-background) lg:grid-cols-[1.2fr_1fr]">
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
                <img
                  src={featuredNews.featuredImage || "/placeholder.svg"}
                  alt={featuredNews.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <Badge className="absolute bottom-4 left-4 bg-white/90 text-black hover:bg-white">
                  {getCategoryLabel(featuredNews)}
                </Badge>
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-10">
                <div className="mb-3 flex items-center gap-2 text-sm text-(--color-foreground-muted)">
                  <Clock className="h-4 w-4" />
                  {featuredNews.publishedAt ? getTimeAgo(featuredNews.publishedAt) : 'Yeni'}
                </div>
                <h2 className="mb-4 text-2xl font-bold lg:text-3xl">{featuredNews.title}</h2>
                <p className="mb-6 text-(--color-foreground-muted) leading-relaxed">{featuredNews.excerpt || featuredNews.title}</p>
                <Button asChild size="lg" className="w-fit">
                  <Link href={`/haberler/${featuredNews.slug}`}>
                    Haberi Oku
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

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
          {marketData.length === 0 ? (
            <div className="text-center py-8 text-sm text-(--color-foreground-muted)">
              Piyasa verileri yükleniyor...
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(() => {
                const usdTry = getItemBySymbol('USD/TRY')
                const eurTry = getItemBySymbol('EUR/TRY')
                const btc = getItemBySymbol('BTC')
                const bist100 = marketData.find(item => item.name?.includes('BIST 100') || item.symbol === 'XU100')
                
                const items = [
                  { name: 'USD/TRY', item: usdTry },
                  { name: 'EUR/TRY', item: eurTry },
                  { name: 'BTC/USD', item: btc },
                  { name: 'BIST 100', item: bist100 },
                ].filter(i => i.item) // Sadece bulunanları göster
                
                return items.map(({ name, item }) => (
                  <div key={name} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm text-(--color-foreground-muted)">{name}</p>
                      <p className="text-lg font-bold">{formatPrice(item)}</p>
                    </div>
                    <span className={`text-sm font-medium ${item?.isUp ? "text-green-600" : "text-red-600"}`}>
                      {formatChange(item)}
                    </span>
                  </div>
                ))
              })()}
            </div>
          )}
        </div>

        {/* News Grid */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Son Haberler</h2>
          {otherNews.length === 0 ? (
            <p className="text-center text-(--color-foreground-muted)">Henüz haber bulunmuyor</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(() => {
                const adPositions = getAdPositions(adSlotsByPosition.BETWEEN_NEWS.length)
                let adIndex = 0
                
                return otherNews.map((article, index) => {
                  const showAd = adPositions.includes(index + 1) && adIndex < adSlotsByPosition.BETWEEN_NEWS.length
                  const currentAd = showAd ? adSlotsByPosition.BETWEEN_NEWS[adIndex] : null
                  
                  if (showAd) adIndex++
                  
                  return (
                    <div key={article.id}>
                      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                        <Link href={`/haberler/${article.id}`}>
                          <div className="relative aspect-[4/3] overflow-hidden sm:aspect-video">
                            <img
                              src={article.featuredImage || "/placeholder.svg"}
                              alt={article.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <Badge className="absolute right-2 top-2 bg-white/90 text-black backdrop-blur-sm sm:right-3 sm:top-3">
                              {getCategoryLabel(article)}
                            </Badge>
                          </div>
                        </Link>
                        <CardHeader className="p-3 sm:p-6">
                          <div className="mb-1 flex items-center gap-1 text-xs text-(--color-foreground-muted)">
                            <Clock className="h-3 w-3" />
                            {article.publishedAt ? getTimeAgo(article.publishedAt) : 'Yeni'}
                          </div>
                          <CardTitle className="line-clamp-2 text-base leading-tight sm:text-lg">{article.title}</CardTitle>
                          <CardDescription className="line-clamp-2 text-sm">{article.excerpt || article.title}</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-3 pt-0 sm:p-6 sm:pt-0">
                          <Button asChild variant="ghost" size="sm" className="w-full justify-between text-sm">
                            <Link href={`/haberler/${article.slug}`}>
                              Devamını Oku
                              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                      {/* BETWEEN_NEWS reklamları - belirlenen pozisyonlarda */}
                      {currentAd && (
                        <div className="col-span-full mt-4">
                          <NewsAdSlotDisplay key={currentAd.id} slot={currentAd} />
                        </div>
                      )}
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>

        {/* BOTTOM Ad Slots */}
        {adSlotsByPosition.BOTTOM.length > 0 && (
          <div className="mb-12">
            {adSlotsByPosition.BOTTOM.map((slot) => (
              <NewsAdSlotDisplay key={slot.id} slot={slot} />
            ))}
          </div>
        )}

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
