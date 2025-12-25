"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Star, Bell, Share2, TrendingUp, TrendingDown, Calendar, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { marketApi, MarketDetailResponse } from "@/lib/market-api"
import { toast } from "sonner"
import { PriceChart } from "@/components/markets/PriceChart"
import { RelatedMarkets } from "@/components/markets/RelatedMarkets"

interface MarketDetailClientProps {
  symbol: string
}

export default function MarketDetailClient({ symbol }: MarketDetailClientProps) {
  const [timeRange, setTimeRange] = useState("1D")
  const [isFavorite, setIsFavorite] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [marketData, setMarketData] = useState<MarketDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMarketData()
    
    // Her 30 saniyede bir güncelle
    const interval = setInterval(loadMarketData, 30000)
    
    return () => clearInterval(interval)
  }, [symbol])

  const loadMarketData = async () => {
    try {
      setLoading(true)
      const data = await marketApi.getMarketDetail(symbol)
      if (data) {
        setMarketData(data)
      } else {
        toast.error('Piyasa verisi bulunamadı')
      }
    } catch (error: any) {
      console.error('Market detay verisi yüklenemedi:', error)
      toast.error('Piyasa verisi yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !marketData) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (!marketData) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Piyasa Verisi Bulunamadı</h1>
            <Link href="/piyasalar">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Piyasalara Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const technicalIndicators = [
    { name: "RSI (14)", value: "52.34", signal: "Nötr" },
    { name: "MACD (12,26)", value: "0.023", signal: "Al" },
    { name: "MA (50)", value: "37.85", signal: "Al" },
    { name: "MA (200)", value: "35.12", signal: "Güçlü Al" },
    { name: "Bollinger Bantları", value: "38.20-38.90", signal: "Nötr" },
    { name: "Stochastic", value: "68.45", signal: "Nötr" },
  ]

  // RelatedMarkets component'i kullanılacak, bu mock data kaldırıldı

  const news = [
    {
      id: 1,
      title: "Dolar/TL'de yeni rekor beklentisi",
      date: "2 saat önce",
      source: "Bloomberg HT",
    },
    {
      id: 2,
      title: "TCMB faiz kararı öncesi piyasalarda sakin seyir",
      date: "5 saat önce",
      source: "Investing.com",
    },
    {
      id: 3,
      title: "ABD enflasyon verileri dolar kurunu nasıl etkiler?",
      date: "1 gün önce",
      source: "Finanscözüm",
    },
  ]

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/piyasalar" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Piyasalara Dön
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{marketData.symbol}</h1>
                <Badge variant="outline">{marketData.type}</Badge>
              </div>
              <p className="text-muted-foreground">{marketData.name}</p>
            </div>

            <div className="flex gap-2">
              <Button variant={isFavorite ? "default" : "outline"} size="sm" onClick={() => setIsFavorite(!isFavorite)}>
                <Star className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? "Favorilerde" : "Favorilere Ekle"}
              </Button>
              <Button
                variant={isFollowing ? "default" : "outline"}
                size="sm"
                onClick={() => setIsFollowing(!isFollowing)}
              >
                <Bell className="mr-2 h-4 w-4" />
                {isFollowing ? "Takip Ediliyor" : "Takip Et"}
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Paylaş
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ana İçerik */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fiyat Kartı */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-end gap-4 mb-6">
                  <div className="text-5xl font-bold">
                    {marketData.type === 'Kripto Para' ? '$' : marketData.type === 'Emtia' && marketData.symbol === 'ONS_ALTIN' ? '$' : '₺'}
                    {marketData.currentPrice.toLocaleString('tr-TR', { maximumFractionDigits: marketData.type === 'Döviz' ? 4 : 2 })}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {marketData.changePercent > 0 ? (
                      <TrendingUp className="h-6 w-6 text-success" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-destructive" />
                    )}
                    <span
                      className={`text-2xl font-semibold ${
                        marketData.changePercent > 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {marketData.change > 0 ? "+" : ""}
                      {marketData.change.toFixed(marketData.type === 'Döviz' ? 4 : 2)} ({marketData.changePercent > 0 ? "+" : ""}
                      {marketData.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                {/* Fiyat Detayları */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Açılış</div>
                    <div className="font-semibold">{marketData.open.toLocaleString('tr-TR', { maximumFractionDigits: marketData.type === 'Döviz' ? 4 : 2 })}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Yüksek</div>
                    <div className="font-semibold text-success">{marketData.high.toLocaleString('tr-TR', { maximumFractionDigits: marketData.type === 'Döviz' ? 4 : 2 })}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Düşük</div>
                    <div className="font-semibold text-destructive">{marketData.low.toLocaleString('tr-TR', { maximumFractionDigits: marketData.type === 'Döviz' ? 4 : 2 })}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Ö. Kapanış</div>
                    <div className="font-semibold">{marketData.prevClose.toLocaleString('tr-TR', { maximumFractionDigits: marketData.type === 'Döviz' ? 4 : 2 })}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grafik */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle>Fiyat Grafiği</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    {["1S", "1G", "1H", "1A", "3A", "1Y", "5Y", "Tümü"].map((range) => (
                      <Button
                        key={range}
                        variant={timeRange === range ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeRange(range)}
                      >
                        {range}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <PriceChart
                  symbol={symbol}
                  timeRange={timeRange}
                  currentPrice={marketData.currentPrice}
                  isUp={marketData.changePercent >= 0}
                />
              </CardContent>
            </Card>

            {/* Teknik Analiz ve Temel Bilgiler */}
            <Tabs defaultValue="technical" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="technical">Teknik Analiz</TabsTrigger>
                <TabsTrigger value="fundamentals">Temel Bilgiler</TabsTrigger>
              </TabsList>
              <TabsContent value="technical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Teknik Göstergeler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {technicalIndicators.map((indicator) => (
                        <div
                          key={indicator.name}
                          className="flex items-center justify-between py-3 border-b last:border-0"
                        >
                          <div>
                            <div className="font-medium">{indicator.name}</div>
                            <div className="text-sm text-muted-foreground">{indicator.value}</div>
                          </div>
                          <Badge
                            variant={
                              indicator.signal.includes("Al")
                                ? "default"
                                : indicator.signal.includes("Sat")
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {indicator.signal}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Genel Teknik Görünüm</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Günlük</span>
                        <Badge variant="default">AL</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Haftalık</span>
                        <Badge variant="default">GÜÇLÜ AL</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Aylık</span>
                        <Badge variant="secondary">NÖTR</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="fundamentals" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Temel Bilgiler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="py-3 border-b">
                        <div className="text-sm text-muted-foreground mb-1">Tür</div>
                        <div className="font-medium">{marketData.type}</div>
                      </div>
                      <div className="py-3 border-b">
                        <div className="text-sm text-muted-foreground mb-1">Kategori</div>
                        <div className="font-medium">{marketData.category}</div>
                      </div>
                      {marketData.high52w && (
                        <div className="py-3 border-b">
                          <div className="text-sm text-muted-foreground mb-1">52 Hafta Yüksek</div>
                          <div className="font-medium text-success">{marketData.high52w.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</div>
                        </div>
                      )}
                      {marketData.low52w && (
                        <div className="py-3 border-b">
                          <div className="text-sm text-muted-foreground mb-1">52 Hafta Düşük</div>
                          <div className="font-medium text-destructive">{marketData.low52w.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</div>
                        </div>
                      )}
                      {marketData.volume && (
                        <div className="py-3 border-b">
                          <div className="text-sm text-muted-foreground mb-1">Günlük Hacim</div>
                          <div className="font-medium">{marketData.volume.toLocaleString('tr-TR')}</div>
                        </div>
                      )}
                      {marketData.marketCap && (
                        <div className="py-3 border-b">
                          <div className="text-sm text-muted-foreground mb-1">Piyasa Değeri</div>
                          <div className="font-medium">{marketData.marketCap}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Önemli Seviyeler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Destek 1</span>
                          <span className="font-medium">38.20</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Destek 2</span>
                          <span className="font-medium">37.85</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Direnç 1</span>
                          <span className="font-medium">38.90</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Direnç 2</span>
                          <span className="font-medium">39.25</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Yan Panel */}
          <div className="space-y-6">
            {/* İlgili Piyasalar */}
            {marketData && (
              <RelatedMarkets
                currentSymbol={symbol}
                category={(() => {
                  const categoryMap: Record<string, 'forex' | 'crypto' | 'stock' | 'commodity'> = {
                    'Döviz': 'forex',
                    'Kripto Para': 'crypto',
                    'Hisse Senedi': 'stock',
                    'Emtia': 'commodity',
                  }
                  return categoryMap[marketData.type] || 'forex'
                })()}
              />
            )}

            {/* Son Haberler */}
            <Card>
              <CardHeader>
                <CardTitle>Son Haberler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {news.map((item) => (
                    <Link
                      key={item.id}
                      href={`/haberler/${item.id}`}
                      className="block p-3 rounded-lg border hover:border-primary hover:bg-accent/50 transition-colors"
                    >
                      <h3 className="font-medium mb-2 line-clamp-2">{item.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{item.source}</span>
                        <span>{item.date}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                  <Link href="/haberler">Tüm Haberleri Gör</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Hızlı Araçlar */}
            <Card>
              <CardHeader>
                <CardTitle>Hesaplama Araçları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/araclar/doviz-cevirici">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Döviz Çevirici
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/araclar/kredi-hesaplama">
                    <Calendar className="mr-2 h-4 w-4" />
                    Kredi Hesaplama
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
