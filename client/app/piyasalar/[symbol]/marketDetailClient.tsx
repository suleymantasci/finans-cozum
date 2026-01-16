"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, Star, Bell, Share2, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { marketApi, MarketDetailResponse } from "@/lib/market-api"
import { toast } from "sonner"
import { RelatedMarkets } from "@/components/markets/RelatedMarkets"
import { favoriteMarketsApi } from "@/lib/favorite-markets-api"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { formatMarketPrice, formatCryptoPrice } from "@/lib/utils"

interface MarketDetailClientProps {
  symbol: string
}

export default function MarketDetailClient({ symbol }: MarketDetailClientProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [marketData, setMarketData] = useState<MarketDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const getCategoryFromType = (type: string): 'forex' | 'crypto' | 'stock' | 'commodity' => {
    const categoryMap: Record<string, 'forex' | 'crypto' | 'stock' | 'commodity'> = {
      'Döviz': 'forex',
      'Kripto Para': 'crypto',
      'Hisse Senedi': 'stock',
      'Emtia': 'commodity',
    }
    return categoryMap[type] || 'forex'
  }

  const checkFavoriteStatus = useCallback(async (data: MarketDetailResponse) => {
    if (!isAuthenticated) {
      setIsFavorite(false)
      return
    }

    try {
      const category = getCategoryFromType(data.type)
      const response = await favoriteMarketsApi.checkFavorite(data.symbol, category)
      setIsFavorite(response.isFavorite)
    } catch (error) {
      setIsFavorite(false)
    }
  }, [isAuthenticated])

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

  useEffect(() => {
    loadMarketData()
    
    // Her 30 saniyede bir güncelle
    const interval = setInterval(loadMarketData, 30000)
    
    return () => clearInterval(interval)
  }, [symbol])

  // Market data ve authentication durumu değiştiğinde favori durumunu kontrol et
  useEffect(() => {
    if (marketData && isAuthenticated) {
      checkFavoriteStatus(marketData)
    } else if (!isAuthenticated) {
      setIsFavorite(false)
    }
  }, [marketData, isAuthenticated, checkFavoriteStatus])

  const handleToggleFavorite = async () => {
    if (!marketData) return

    if (!isAuthenticated) {
      toast.error('Favorilere eklemek için giriş yapmanız gerekiyor', {
        action: {
          label: 'Giriş Yap',
          onClick: () => router.push('/giris'),
        },
      })
      return
    }

    setIsFavoriteLoading(true)
    try {
      const category = getCategoryFromType(marketData.type)
      if (isFavorite) {
        await favoriteMarketsApi.removeFavorite(marketData.symbol, category)
        setIsFavorite(false)
        toast.success('Piyasa favorilerden kaldırıldı')
      } else {
        await favoriteMarketsApi.addFavorite(marketData.symbol, category)
        setIsFavorite(true)
        toast.success('Piyasa favorilere eklendi')
      }
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setIsFavoriteLoading(false)
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
              <Button 
                variant={isFavorite ? "default" : "outline"} 
                size="sm" 
                onClick={handleToggleFavorite}
                disabled={isFavoriteLoading}
              >
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

        {/* Fiyat Kartı - Ana Bilgi */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className="text-sm px-3 py-1">{marketData.type}</Badge>
                  <Badge variant="secondary" className="text-sm px-3 py-1">{marketData.category}</Badge>
                </div>
                <div className="flex items-end gap-4 mb-6">
                  <div className="text-5xl md:text-6xl font-bold">
                    {marketData.type === 'Kripto Para' ? '$' : marketData.type === 'Emtia' && marketData.symbol === 'ONS_ALTIN' ? '$' : '₺'}
                    {formatMarketPrice(marketData.currentPrice, marketData.type, marketData.symbol)}
                  </div>
                  <div className="flex items-center gap-2 pb-2">
                    {marketData.changePercent > 0 ? (
                      <TrendingUp className="h-6 w-6 text-success" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-destructive" />
                    )}
                    <span
                      className={`text-xl md:text-2xl font-semibold ${
                        marketData.changePercent > 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {marketData.change > 0 ? "+" : ""}
                      {marketData.type === 'Kripto Para' 
                        ? formatCryptoPrice(Math.abs(marketData.change))
                        : marketData.change.toFixed(marketData.type === 'Döviz' ? 4 : 2)
                      } ({marketData.changePercent > 0 ? "+" : ""}
                      {marketData.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fiyat Detayları Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Açılış</div>
                <div className="text-lg font-semibold">
                  {marketData.type === 'Kripto Para' ? '$' : marketData.type === 'Emtia' && marketData.symbol === 'ONS_ALTIN' ? '$' : '₺'}
                  {formatMarketPrice(marketData.open, marketData.type, marketData.symbol)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Yüksek</div>
                <div className="text-lg font-semibold text-success">
                  {marketData.type === 'Kripto Para' ? '$' : marketData.type === 'Emtia' && marketData.symbol === 'ONS_ALTIN' ? '$' : '₺'}
                  {formatMarketPrice(marketData.high, marketData.type, marketData.symbol)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Düşük</div>
                <div className="text-lg font-semibold text-destructive">
                  {marketData.type === 'Kripto Para' ? '$' : marketData.type === 'Emtia' && marketData.symbol === 'ONS_ALTIN' ? '$' : '₺'}
                  {formatMarketPrice(marketData.low, marketData.type, marketData.symbol)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Önceki Kapanış</div>
                <div className="text-lg font-semibold">
                  {marketData.type === 'Kripto Para' ? '$' : marketData.type === 'Emtia' && marketData.symbol === 'ONS_ALTIN' ? '$' : '₺'}
                  {formatMarketPrice(marketData.prevClose, marketData.type, marketData.symbol)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ana İçerik */}
          <div className="lg:col-span-2 space-y-6">
            {/* Temel Bilgiler */}
            <Card>
              <CardHeader>
                <CardTitle>Temel Bilgiler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Sembol</div>
                    <div className="text-lg font-semibold">{marketData.symbol}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Ad</div>
                    <div className="text-lg font-semibold">{marketData.name}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Tür</div>
                    <div className="text-lg font-semibold">{marketData.type}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Kategori</div>
                    <div className="text-lg font-semibold">{marketData.category}</div>
                  </div>
                  {marketData.volume && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Günlük Hacim</div>
                      <div className="text-lg font-semibold">{marketData.volume.toLocaleString('tr-TR')}</div>
                    </div>
                  )}
                  {marketData.marketCap && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Piyasa Değeri</div>
                      <div className="text-lg font-semibold">{marketData.marketCap}</div>
                    </div>
                  )}
                  {marketData.high52w && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">52 Hafta Yüksek</div>
                      <div className="text-lg font-semibold text-success">
                        {marketData.type === 'Kripto Para' ? '$' : '₺'}
                        {formatMarketPrice(marketData.high52w, marketData.type, marketData.symbol)}
                      </div>
                    </div>
                  )}
                  {marketData.low52w && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">52 Hafta Düşük</div>
                      <div className="text-lg font-semibold text-destructive">
                        {marketData.type === 'Kripto Para' ? '$' : '₺'}
                        {formatMarketPrice(marketData.low52w, marketData.type, marketData.symbol)}
                      </div>
                    </div>
                  )}
                  {marketData.lastUpdate && (
                    <div className="space-y-1 sm:col-span-2">
                      <div className="text-sm text-muted-foreground">Son Güncelleme</div>
                      <div className="text-sm font-medium">
                        {new Date(marketData.lastUpdate).toLocaleString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
          </div>
        </div>
      </div>
    </div>
  )
}
