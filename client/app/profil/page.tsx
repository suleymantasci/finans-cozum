"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { User, Bell, Bookmark, Calendar, Mail, Phone, Edit2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { RequireAuth } from "@/components/auth/require-auth"
import { useAuth } from "@/contexts/auth-context"
import { favoriteNewsApi } from "@/lib/favorite-news-api"
import { favoriteMarketsApi, FavoriteMarket } from "@/lib/favorite-markets-api"
import { favoriteToolsApi, FavoriteTool } from "@/lib/favorite-tools-api"
import { marketApi, MarketDataItem } from "@/lib/market-api"
import { newsApi, News } from "@/lib/news-api"
import { getToolIcon } from "@/components/icons/tool-icons"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { TrendingUp, TrendingDown } from "lucide-react"
import { toast } from "sonner"

function ProfilPageContent() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@example.com",
    phone: "+90 532 123 45 67",
  })
  const [savedNews, setSavedNews] = useState<News[]>([])
  const [isLoadingNews, setIsLoadingNews] = useState(true)
  const [favoriteMarkets, setFavoriteMarkets] = useState<FavoriteMarket[]>([])
  const [marketData, setMarketData] = useState<MarketDataItem[]>([])
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true)
  const [favoriteTools, setFavoriteTools] = useState<FavoriteTool[]>([])
  const [isLoadingTools, setIsLoadingTools] = useState(true)
  
  // React Strict Mode'da çift çağrıları önlemek için ref kullan
  const hasLoadedRef = useRef(false)

  const loadFavoriteNews = async () => {
    try {
      setIsLoadingNews(true)
      const news = await favoriteNewsApi.getFavorites()
      setSavedNews(news)
    } catch (error) {
      console.error('Favori haberler yüklenemedi:', error)
    } finally {
      setIsLoadingNews(false)
    }
  }

  const loadFavoriteMarkets = async () => {
    try {
      setIsLoadingMarkets(true)
      const favorites = await favoriteMarketsApi.getFavorites()
      setFavoriteMarkets(favorites)
      
      // Tüm piyasa verilerini getir
      const allMarketData = await marketApi.getAllMarketData()
      const allMarkets: MarketDataItem[] = [
        ...allMarketData.forex,
        ...allMarketData.crypto,
        ...allMarketData.stocks,
        ...allMarketData.commodities,
      ]
      setMarketData(allMarkets)
    } catch (error) {
      console.error('Favori piyasalar yüklenemedi:', error)
    } finally {
      setIsLoadingMarkets(false)
    }
  }

  const loadFavoriteTools = async () => {
    try {
      setIsLoadingTools(true)
      const tools = await favoriteToolsApi.getFavorites()
      setFavoriteTools(tools)
    } catch (error) {
      console.error('Favori araçlar yüklenemedi:', error)
    } finally {
      setIsLoadingTools(false)
    }
  }

  useEffect(() => {
    // React Strict Mode'da çift çağrıları önle
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    
    loadFavoriteNews()
    loadFavoriteMarkets()
    loadFavoriteTools()
  }, [])

  const handleRemoveFavorite = async (newsId: string) => {
    try {
      await favoriteNewsApi.removeFavorite(newsId)
      setSavedNews(savedNews.filter(n => n.id !== newsId))
      // toast.success('Haber favorilerden kaldırıldı')
    } catch (error) {
      console.error('Haber favorilerden kaldırılamadı:', error)
    }
  }

  const handleRemoveFavoriteMarket = async (symbol: string, category: string) => {
    try {
      await favoriteMarketsApi.removeFavorite(symbol, category as 'forex' | 'crypto' | 'stock' | 'commodity')
      setFavoriteMarkets(favoriteMarkets.filter(f => !(f.symbol === symbol && f.category === category)))
      toast.success('Piyasa favorilerden kaldırıldı')
    } catch (error) {
      console.error('Piyasa favorilerden kaldırılamadı:', error)
      toast.error('Bir hata oluştu')
    }
  }

  const handleRemoveFavoriteTool = async (toolId: string) => {
    try {
      await favoriteToolsApi.removeFavorite(toolId)
      setFavoriteTools(favoriteTools.filter(t => t.toolId !== toolId))
      toast.success('Araç favorilerden kaldırıldı')
    } catch (error) {
      console.error('Araç favorilerden kaldırılamadı:', error)
      toast.error('Bir hata oluştu')
    }
  }

  const getSymbolSlug = (item: MarketDataItem) => {
    if (item.category === 'forex') {
      return item.symbol.toLowerCase().replace(/\//g, '-')
    } else if (item.category === 'crypto') {
      return `${item.symbol.toLowerCase()}-usd`
    } else if (item.category === 'commodity') {
      return item.symbol.toLowerCase().replace(/_/g, '-')
    }
    return item.symbol.toLowerCase()
  }

  // Favori piyasaları gerçek verilerle eşleştir
  const favoriteMarketsWithData = favoriteMarkets.map(fav => {
    const market = marketData.find(
      m => m.symbol === fav.symbol && m.category === fav.category
    )
    return {
      ...fav,
      market,
    }
  }).filter(item => item.market) // Sadece market verisi olanları göster

  const formatTimeAgo = (date: string | Date | undefined) => {
    if (!date) return '--'
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: tr })
    } catch {
      return '--'
    }
  }

  const getCategoryLabel = (item: News) => {
    if (item.category && typeof item.category === 'object' && 'name' in item.category) {
      return item.category.name
    }
    return 'Genel'
  }

  const MarketCategoryList = ({
    favorites,
    getSymbolSlug,
    handleRemove,
  }: {
    favorites: typeof favoriteMarketsWithData
    getSymbolSlug: (item: MarketDataItem) => string
    handleRemove: (symbol: string, category: string) => void
  }) => {
    const validFavorites = favorites.filter((f): f is typeof f & { market: MarketDataItem } => !!f.market)

    if (validFavorites.length === 0) {
      return (
        <div className="text-center py-8 text-sm text-(--color-foreground-muted)">
          Bu kategoride favori piyasanız bulunmamaktadır
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {validFavorites.map((fav) => {
          const market = fav.market
          return (
            <div key={`${fav.symbol}-${fav.category}`} className="group flex items-center justify-between rounded-lg border p-4 transition-all hover:border-(--color-primary) hover:shadow-md">
              <Link href={`/piyasalar/${getSymbolSlug(market)}`} className="flex-1 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold group-hover:text-(--color-primary)">{market.symbol}</h3>
                  <p className="text-sm text-(--color-foreground-muted)">{market.name || market.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="mb-1 font-semibold">
                    {market.category === 'crypto' ? '$' : market.category === 'commodity' && market.symbol === 'ONS_ALTIN' ? '$' : '₺'}
                    {market.price.toLocaleString("tr-TR", { 
                      minimumFractionDigits: market.category === 'forex' ? 4 : 2,
                      maximumFractionDigits: market.category === 'forex' ? 4 : 2
                    })}
                  </p>
                  <p
                    className={`text-sm font-medium flex items-center justify-end gap-1 ${
                      market.isUp ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {market.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {market.changePercent > 0 ? "+" : ""}
                    {market.changePercent.toFixed(2)}%
                  </p>
                </div>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-4 shrink-0"
                onClick={() => handleRemove(fav.symbol, fav.category)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )
        })}
      </div>
    )
  }

  const followedEconomicEvents = [
    {
      id: "1",
      date: "20 Ara 2024",
      time: "11:00",
      event: "TCMB Faiz Kararı",
      country: "🇹🇷 Türkiye",
      impact: "high" as const,
    },
    {
      id: "2",
      date: "22 Ara 2024",
      time: "16:30",
      event: "İşsizlik Maaşı Başvuruları",
      country: "🇺🇸 ABD",
      impact: "high" as const,
    },
    {
      id: "3",
      date: "25 Ara 2024",
      time: "10:00",
      event: "Tüketici Fiyat Endeksi (TÜFE)",
      country: "🇹🇷 Türkiye",
      impact: "high" as const,
    },
  ]

  const followedDividends = [
    {
      id: "1",
      date: "22 Ara 2024",
      company: "Türk Hava Yolları",
      ticker: "THYAO",
      amount: "₺2.50",
      yield: "4.2%",
    },
    {
      id: "2",
      date: "28 Ara 2024",
      company: "Ereğli Demir Çelik",
      ticker: "EREGL",
      amount: "₺1.80",
      yield: "5.1%",
    },
  ]

  const followedIPOs = [
    {
      id: "1",
      date: "19 Ara 2024",
      company: "Tech Startup A.Ş.",
      sector: "Teknoloji",
      exchange: "BIST",
      priceRange: "₺15-18",
      status: "upcoming" as const,
    },
    {
      id: "2",
      date: "02 Oca 2025",
      company: "Enerji Yatırım A.Ş.",
      sector: "Enerji",
      exchange: "BIST",
      priceRange: "₺22-25",
      status: "upcoming" as const,
    },
  ]



  const handleSave = () => {
    setIsEditing(false)
    // Burada profil güncelleme API çağrısı yapılabilir
  }

  return (
    <div className="min-h-screen bg-(--color-background)">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-(--color-primary)/5 via-transparent to-(--color-accent)/5 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-(--color-primary)/10">
                <User className="h-10 w-10 text-(--color-primary)" />
              </div>
              <div className="flex-1">
                <h1 className="mb-2 text-3xl font-bold md:text-4xl">Profilim</h1>
                <p className="text-(--color-foreground-muted)">Favorilerinizi ve takip ettiklerinizi yönetin</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <Tabs defaultValue="favorites" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="favorites">
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Favoriler</span>
                </TabsTrigger>
                <TabsTrigger value="calendars">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Takvimler</span>
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Bildirimler</span>
                </TabsTrigger>
                <TabsTrigger value="profile">
                  <User className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Profil</span>
                </TabsTrigger>
              </TabsList>

              {/* Favoriler Tab */}
              <TabsContent value="favorites" className="mt-6 space-y-6">
                {/* Favori Haberler */}
                <Card>
                  <CardHeader>
                    <CardTitle>Favori Haberler</CardTitle>
                    <CardDescription>Kaydettiğiniz haberler burada görünür</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingNews ? (
                      <div className="text-center py-8 text-sm text-(--color-foreground-muted)">
                        Yükleniyor...
                      </div>
                    ) : savedNews.length === 0 ? (
                      <div className="text-center py-8 text-sm text-(--color-foreground-muted)">
                        Henüz favori haber yok. Haberleri kaydetmek için haber detay sayfasındaki "Kaydet" butonunu kullanın.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {savedNews.map((news) => (
                          <div key={news.id} className="group flex gap-4 rounded-lg border p-4 transition-all hover:border-(--color-primary) hover:shadow-md">
                            <Link href={`/haberler/${news.slug || news.id}`} className="flex-1 flex gap-4">
                              {news.featuredImage ? (
                                <img
                                  src={news.featuredImage}
                                  alt={news.title}
                                  className="h-20 w-20 rounded-lg object-cover shrink-0"
                                />
                              ) : (
                                <div className="h-20 w-20 rounded-lg bg-(--color-muted) shrink-0 flex items-center justify-center">
                                  <span className="text-xs text-(--color-foreground-muted)">Görsel Yok</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <Badge variant="secondary" className="mb-2 text-xs">
                                  {getCategoryLabel(news)}
                                </Badge>
                                <h3 className="mb-1 font-semibold group-hover:text-(--color-primary) line-clamp-2">{news.title}</h3>
                                <p className="text-sm text-(--color-foreground-muted)">
                                  {formatTimeAgo(news.publishedAt || news.createdAt)}
                                </p>
                              </div>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="shrink-0"
                              onClick={() => handleRemoveFavorite(news.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Favori Piyasalar */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Favori Piyasalar</CardTitle>
                        <CardDescription>Takip ettiğiniz döviz, kripto ve hisse senetleri</CardDescription>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/piyasalar">Piyasalara Git</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingMarkets ? (
                      <div className="text-center py-8 text-sm text-(--color-foreground-muted)">
                        Yükleniyor...
                      </div>
                    ) : favoriteMarketsWithData.length === 0 ? (
                      <div className="text-center py-8 text-sm text-(--color-foreground-muted)">
                        Henüz favori piyasa yok. Piyasaları favorilere eklemek için piyasa listesi veya detay sayfasındaki yıldız ikonunu kullanın.
                      </div>
                    ) : (
                      <Tabs defaultValue="forex" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="forex">Döviz</TabsTrigger>
                          <TabsTrigger value="crypto">Kripto</TabsTrigger>
                          <TabsTrigger value="stock">Hisse</TabsTrigger>
                          <TabsTrigger value="commodity">Emtia</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="forex" className="mt-4">
                          <MarketCategoryList
                            favorites={favoriteMarketsWithData.filter(f => f.category === "forex")}
                            getSymbolSlug={getSymbolSlug}
                            handleRemove={handleRemoveFavoriteMarket}
                          />
                        </TabsContent>
                        
                        <TabsContent value="crypto" className="mt-4">
                          <MarketCategoryList
                            favorites={favoriteMarketsWithData.filter(f => f.category === "crypto")}
                            getSymbolSlug={getSymbolSlug}
                            handleRemove={handleRemoveFavoriteMarket}
                          />
                        </TabsContent>
                        
                        <TabsContent value="stock" className="mt-4">
                          <MarketCategoryList
                            favorites={favoriteMarketsWithData.filter(f => f.category === "stock")}
                            getSymbolSlug={getSymbolSlug}
                            handleRemove={handleRemoveFavoriteMarket}
                          />
                        </TabsContent>
                        
                        <TabsContent value="commodity" className="mt-4">
                          <MarketCategoryList
                            favorites={favoriteMarketsWithData.filter(f => f.category === "commodity")}
                            getSymbolSlug={getSymbolSlug}
                            handleRemove={handleRemoveFavoriteMarket}
                          />
                        </TabsContent>
                      </Tabs>
                    )}
                  </CardContent>
                </Card>

                {/* Favori Araçlar */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Favori Araçlar</CardTitle>
                        <CardDescription>Sık kullandığınız hesaplama araçları</CardDescription>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/araclar">Tüm Araçlar</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTools ? (
                      <div className="text-center py-8 text-sm text-(--color-foreground-muted)">
                        Yükleniyor...
                      </div>
                    ) : favoriteTools.length === 0 ? (
                      <div className="text-center py-8 text-sm text-(--color-foreground-muted)">
                        Henüz favori araç yok. Araçları favorilere eklemek için araç detay sayfasındaki "Favorilere Ekle" butonunu kullanın.
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {favoriteTools.map((favoriteTool) => {
                          const IconComponent = getToolIcon(favoriteTool.tool.icon)
                          return (
                            <div key={favoriteTool.id} className="group flex items-start gap-4 rounded-lg border p-4 transition-all hover:border-(--color-primary) hover:shadow-md">
                              <Link href={`/araclar/${favoriteTool.tool.slug}`} className="flex-1 flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--color-primary)/10">
                                  <IconComponent className="h-6 w-6 text-(--color-primary)" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="mb-1 font-semibold group-hover:text-(--color-primary)">{favoriteTool.tool.name}</h3>
                                  <p className="text-sm text-(--color-foreground-muted)">{favoriteTool.tool.description || 'Araç açıklaması bulunmuyor'}</p>
                                </div>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="shrink-0"
                                onClick={() => handleRemoveFavoriteTool(favoriteTool.toolId)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Takvimler Tab */}
              <TabsContent value="calendars" className="mt-6 space-y-6">
                {/* Ekonomik Takvim */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Ekonomik Takvim</CardTitle>
                        <CardDescription>Takip ettiğiniz ekonomik veriler</CardDescription>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/ekonomik-takvim">Tümünü Gör</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {followedEconomicEvents.map((event) => (
                        <div key={event.id} className="flex items-center gap-4 rounded-lg border p-3">
                          <div className="text-center">
                            <p className="text-sm font-semibold text-(--color-primary)">{event.time}</p>
                            <p className="text-xs text-(--color-foreground-muted)">{event.date}</p>
                          </div>
                          <div className="h-8 w-px bg-(--color-border)" />
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span
                                className={`inline-flex h-2 w-2 rounded-full ${
                                  event.impact === "high" ? "bg-red-500" : "bg-yellow-500"
                                }`}
                              />
                              <h4 className="font-semibold text-sm">{event.event}</h4>
                            </div>
                            <p className="text-xs text-(--color-foreground-muted)">{event.country}</p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Bell className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>


                {/* Halka Arz Takvimi */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Halka Arz Takvimi</CardTitle>
                        <CardDescription>Takip ettiğiniz halka arzlar</CardDescription>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/halka-arz-takvimi">Tümünü Gör</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {followedIPOs.map((ipo) => (
                        <div key={ipo.id} className="flex items-center gap-4 rounded-lg border p-3">
                          <div className="text-center">
                            <p className="text-xs text-(--color-foreground-muted)">{ipo.date}</p>
                          </div>
                          <div className="h-8 w-px bg-(--color-border)" />
                          <div className="flex-1">
                            <h4 className="mb-1 font-semibold text-sm">{ipo.company}</h4>
                            <p className="text-xs text-(--color-foreground-muted)">
                              {ipo.sector} • {ipo.exchange}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">{ipo.priceRange}</p>
                            <Badge variant="outline" className="text-xs">
                              Yaklaşan
                            </Badge>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Bell className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bildirimler Tab */}
              <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bildirim Ayarları</CardTitle>
                    <CardDescription>Hangi bildirimleri almak istediğinizi seçin</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">Ekonomik Takvim Bildirimleri</p>
                        <p className="text-sm text-(--color-foreground-muted)">
                          Takip ettiğiniz ekonomik veriler için bildirim alın
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Aktif
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">Halka Arz Bildirimleri</p>
                        <p className="text-sm text-(--color-foreground-muted)">
                          Takip ettiğiniz halka arzlar için bildirim alın
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Aktif
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">Haber Bildirimleri</p>
                        <p className="text-sm text-(--color-foreground-muted)">Önemli haberler için bildirim alın</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Kapalı
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profil Tab */}
              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Profil Bilgileri</CardTitle>
                        <CardDescription>Hesap bilgilerinizi görüntüleyin ve düzenleyin</CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Düzenle
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                            <X className="mr-2 h-4 w-4" />
                            İptal
                          </Button>
                          <Button size="sm" onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" />
                            Kaydet
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ad Soyad</Label>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-(--color-foreground-muted)" />
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-(--color-foreground-muted)" />
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-(--color-foreground-muted)" />
                        <Input
                          id="phone"
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <h3 className="mb-4 font-semibold">Hesap İstatistikleri</h3>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border bg-(--color-muted) p-4 text-center">
                          <p className="text-2xl font-bold text-(--color-primary)">{savedNews.length}</p>
                          <p className="text-sm text-(--color-foreground-muted)">Favori Haber</p>
                        </div>
                        <div className="rounded-lg border bg-(--color-muted) p-4 text-center">
                          <p className="text-2xl font-bold text-(--color-primary)">
                            {favoriteMarkets.length + favoriteTools.length}
                          </p>
                          <p className="text-sm text-(--color-foreground-muted)">Favori Araç/Piyasa</p>
                        </div>
                        <div className="rounded-lg border bg-(--color-muted) p-4 text-center">
                          <p className="text-2xl font-bold text-(--color-primary)">
                            {followedEconomicEvents.length + followedDividends.length + followedIPOs.length}
                          </p>
                          <p className="text-sm text-(--color-foreground-muted)">Takip Edilen</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ProfilPage() {
  return (
    <RequireAuth>
      <ProfilPageContent />
    </RequireAuth>
  )
}
