"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, Building2, Coins, LayoutGrid, List, Loader2, Search, ArrowUpDown } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { marketApi, MarketDataItem, TcmbForexResponse } from "@/lib/market-api"
import { toast } from "sonner"
import { favoriteMarketsApi } from "@/lib/favorite-markets-api"
import { useAuth } from "@/contexts/auth-context"
import { Star } from "lucide-react"

export default function MarketsClientPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  
  // URL'den tab parametresini al, yoksa varsayılan olarak "forex"
  const activeTab = searchParams.get('tab') || 'forex'
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [forexData, setForexData] = useState<MarketDataItem[]>([])
  const [forexDate, setForexDate] = useState<string | null>(null) // TCMB döviz kurları tarihi
  const [forexSource, setForexSource] = useState<'tcmb' | 'market'>('tcmb') // TCMB veya Piyasa
  const [cryptoData, setCryptoData] = useState<MarketDataItem[]>([])
  const [stockData, setStockData] = useState<MarketDataItem[]>([])
  const [bistIndices, setBistIndices] = useState<Array<{ name: string; price: number; changePercent: number; isUp: boolean }>>([])
  const [commodityData, setCommodityData] = useState<MarketDataItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // Favori durumları: { "symbol-category": true/false }
  const [favoriteStatuses, setFavoriteStatuses] = useState<Record<string, boolean>>({})
  const [favoriteLoading, setFavoriteLoading] = useState<Record<string, boolean>>({})
  
  // Önceki fiyatları sakla (animasyon için) - useRef kullanarak closure sorununu çözüyoruz
  const prevPricesRef = useRef<Record<string, number>>({})
  const [priceChangeAnimations, setPriceChangeAnimations] = useState<Record<string, 'up' | 'down' | null>>({})
  const isFirstLoadRef = useRef(true)
  
  // Her tab için ayrı arama terimi
  const [searchForex, setSearchForex] = useState("")
  const [searchCrypto, setSearchCrypto] = useState("")
  const [searchStocks, setSearchStocks] = useState("")
  const [searchCommodities, setSearchCommodities] = useState("")
  
  // Borsa için filtreleme ve sıralama
  const [selectedBistGroup, setSelectedBistGroup] = useState<string>("all") // "all", "BIST", "BIST 100", "BIST 50", "BIST 30"
  const [stockSortBy, setStockSortBy] = useState<"none" | "name" | "price" | "volumeLot" | "volumeTL" | "change">("none")
  const [stockSortOrder, setStockSortOrder] = useState<"asc" | "desc">("desc")
  
  // Döviz için sıralama
  const [forexSortBy, setForexSortBy] = useState<"none" | "name" | "price">("none")
  const [forexSortOrder, setForexSortOrder] = useState<"asc" | "desc">("desc")
  
  // Kripto için sıralama
  const [cryptoSortBy, setCryptoSortBy] = useState<"none" | "name" | "price">("none")
  const [cryptoSortOrder, setCryptoSortOrder] = useState<"asc" | "desc">("desc")
  
  // Emtia için sıralama
  const [commoditySortBy, setCommoditySortBy] = useState<"none" | "name" | "price">("none")
  const [commoditySortOrder, setCommoditySortOrder] = useState<"asc" | "desc">("desc")

  
  // Infinite scroll için her tab için ayrı displayed count
  const [displayedForex, setDisplayedForex] = useState(50)
  const [displayedCrypto, setDisplayedCrypto] = useState(50)
  const [displayedStocks, setDisplayedStocks] = useState(50)
  const [displayedCommodities, setDisplayedCommodities] = useState(50)
  
  // Scroll observer için ref'ler (her tab için ayrı)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreForexRef = useRef<HTMLDivElement | null>(null)
  const loadMoreCryptoRef = useRef<HTMLDivElement | null>(null)
  const loadMoreStocksRef = useRef<HTMLDivElement | null>(null)
  const loadMoreCommoditiesRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    loadMarketData()
    
    // Her 30 saniyede bir güncelle
    const interval = setInterval(loadMarketData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Tab değiştiğinde URL'i güncelle
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`/piyasalar?${params.toString()}`, { scroll: false })
  }
  
  // Arama fonksiyonu - symbol ve name'e göre filtrele
  const filterData = (data: MarketDataItem[], searchTerm: string) => {
    if (!searchTerm.trim()) return data
    
    const term = searchTerm.toLowerCase().trim()
    return data.filter(item => 
      item.symbol.toLowerCase().includes(term) ||
      item.name?.toLowerCase().includes(term)
    )
  }
  
  // Favori kontrol fonksiyonu
  const getFavoriteKey = (symbol: string, category: string) => {
    return `${symbol}-${category}`
  }

  const checkAllFavorites = async () => {
    if (!isAuthenticated) return

    try {
      const favorites = await favoriteMarketsApi.getFavorites()
      const statusMap: Record<string, boolean> = {}
      
      favorites.forEach(fav => {
        const key = getFavoriteKey(fav.symbol, fav.category)
        statusMap[key] = true
      })

      setFavoriteStatuses(statusMap)
    } catch (error) {
      console.error('Favori durumları kontrol edilemedi:', error)
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent, item: MarketDataItem) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Favorilere eklemek için giriş yapmanız gerekiyor', {
        action: {
          label: 'Giriş Yap',
          onClick: () => router.push('/giris'),
        },
      })
      return
    }

    const key = getFavoriteKey(item.symbol, item.category)
    const currentStatus = favoriteStatuses[key] || false

    setFavoriteLoading(prev => ({ ...prev, [key]: true }))

    try {
      if (currentStatus) {
        await favoriteMarketsApi.removeFavorite(item.symbol, item.category)
        setFavoriteStatuses(prev => ({ ...prev, [key]: false }))
        toast.success('Favorilerden kaldırıldı')
      } else {
        await favoriteMarketsApi.addFavorite(item.symbol, item.category)
        setFavoriteStatuses(prev => ({ ...prev, [key]: true }))
        toast.success('Favorilere eklendi')
      }
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setFavoriteLoading(prev => ({ ...prev, [key]: false }))
    }
  }
  
  // Favori durumlarını kontrol et
  useEffect(() => {
    if (isAuthenticated && (forexData.length > 0 || cryptoData.length > 0 || stockData.length > 0 || commodityData.length > 0)) {
      checkAllFavorites()
    } else {
      setFavoriteStatuses({})
    }
  }, [isAuthenticated, forexData.length, cryptoData.length, stockData.length, commodityData.length])
  
  // Sıralama fonksiyonu
  const sortData = <T extends MarketDataItem>(
    data: T[],
    sortBy: "none" | "name" | "price" | "volumeLot" | "volumeTL" | "change",
    sortOrder: "asc" | "desc"
  ): T[] => {
    if (sortBy === "none") return data
    
    return [...data].sort((a, b) => {
      let comparison = 0
      
      if (sortBy === "name") {
        const aName = a.name?.toLowerCase() || a.symbol.toLowerCase()
        const bName = b.name?.toLowerCase() || b.symbol.toLowerCase()
        comparison = aName.localeCompare(bName, 'tr')
      } else if (sortBy === "price") {
        comparison = a.price - b.price
      } else if (sortBy === "volumeLot") {
        const aValue = a.metadata?.volume || 0
        const bValue = b.metadata?.volume || 0
        comparison = aValue - bValue
      } else if (sortBy === "volumeTL") {
        const aValue = a.metadata?.volumeTL || 0
        const bValue = b.metadata?.volumeTL || 0
        comparison = aValue - bValue
      } else if (sortBy === "change") {
        comparison = a.changePercent - b.changePercent
      }
      
      return sortOrder === "asc" ? comparison : -comparison
    })
  }
  
  // Borsa için filtreleme ve sıralama
  const filteredStocks = useMemo(() => {
    let filtered = filterData(stockData, searchStocks)
    
    // BIST grubu filtreleme
    if (selectedBistGroup !== "all") {
      filtered = filtered.filter(item => {
        if (selectedBistGroup === "BIST") {
          // BIST grubu yoksa veya sadece "BIST" varsa
          return !item.metadata?.bistGroups || 
                 item.metadata.bistGroups.length === 0 ||
                 (item.metadata.bistGroups.length === 1 && item.metadata.bistGroups[0] === "BIST")
        }
        return item.metadata?.bistGroups?.includes(selectedBistGroup) || false
      })
    }
    
    // Sıralama
    return sortData(filtered, stockSortBy, stockSortOrder)
  }, [stockData, searchStocks, selectedBistGroup, stockSortBy, stockSortOrder])
  
  // Filtrelenmiş ve sıralanmış veriler
  const filteredForex = useMemo(() => {
    const filtered = filterData(forexData, searchForex)
    return sortData(filtered, forexSortBy, forexSortOrder)
  }, [forexData, searchForex, forexSortBy, forexSortOrder])
  
  const filteredCrypto = useMemo(() => {
    const filtered = filterData(cryptoData, searchCrypto)
    return sortData(filtered, cryptoSortBy, cryptoSortOrder)
  }, [cryptoData, searchCrypto, cryptoSortBy, cryptoSortOrder])
  
  const filteredCommodities = useMemo(() => {
    const filtered = filterData(commodityData, searchCommodities)
    return sortData(filtered, commoditySortBy, commoditySortOrder)
  }, [commodityData, searchCommodities, commoditySortBy, commoditySortOrder])
  
  // Görüntülenecek veriler (infinite scroll için)
  const displayedForexData = useMemo(() => filteredForex.slice(0, displayedForex), [filteredForex, displayedForex])
  const displayedCryptoData = useMemo(() => filteredCrypto.slice(0, displayedCrypto), [filteredCrypto, displayedCrypto])
  const displayedStocksData = useMemo(() => filteredStocks.slice(0, displayedStocks), [filteredStocks, displayedStocks])
  const displayedCommoditiesData = useMemo(() => filteredCommodities.slice(0, displayedCommodities), [filteredCommodities, displayedCommodities])
  
  // Infinite scroll callback
  const loadMore = useCallback(() => {
    if (activeTab === 'forex' && displayedForex < filteredForex.length) {
      setDisplayedForex(prev => Math.min(prev + 50, filteredForex.length))
    } else if (activeTab === 'crypto' && displayedCrypto < filteredCrypto.length) {
      setDisplayedCrypto(prev => Math.min(prev + 50, filteredCrypto.length))
    } else if (activeTab === 'stocks' && displayedStocks < filteredStocks.length) {
      setDisplayedStocks(prev => Math.min(prev + 50, filteredStocks.length))
    } else if (activeTab === 'commodities' && displayedCommodities < filteredCommodities.length) {
      setDisplayedCommodities(prev => Math.min(prev + 50, filteredCommodities.length))
    }
  }, [activeTab, displayedForex, displayedCrypto, displayedStocks, displayedCommodities, filteredForex.length, filteredCrypto.length, filteredStocks.length, filteredCommodities.length])
  
  // Intersection Observer ile infinite scroll
  useEffect(() => {
    // Önceki observer'ı temizle
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    
    // Ref'in DOM'a eklenmesini bekle
    const timeoutId = setTimeout(() => {
      // Aktif tab'a göre doğru ref'i al
      let currentRef: HTMLDivElement | null = null
      if (activeTab === 'forex') currentRef = loadMoreForexRef.current
      else if (activeTab === 'crypto') currentRef = loadMoreCryptoRef.current
      else if (activeTab === 'stocks') currentRef = loadMoreStocksRef.current
      else if (activeTab === 'commodities') currentRef = loadMoreCommoditiesRef.current
      
      // Ref yoksa observer oluşturma
      if (!currentRef) {
        return
      }
      
      // Yeni observer oluştur
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            loadMore()
          }
        },
        { threshold: 0.1, rootMargin: '100px' }
      )
      
      // Ref'i gözlemle
      observerRef.current.observe(currentRef)
    }, 100)
    
    return () => {
      clearTimeout(timeoutId)
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMore, activeTab, viewMode])
  
  // Tab değiştiğinde displayed count'ları sıfırla
  useEffect(() => {
    setDisplayedForex(50)
    setDisplayedCrypto(50)
    setDisplayedStocks(50)
    setDisplayedCommodities(50)
  }, [activeTab])
  
  // BIST grubu veya sıralama değiştiğinde displayed count'ı sıfırla
  useEffect(() => {
    setDisplayedStocks(50)
  }, [selectedBistGroup, stockSortBy, stockSortOrder])
  
  // Döviz sıralama değiştiğinde displayed count'ı sıfırla
  useEffect(() => {
    setDisplayedForex(50)
  }, [forexSortBy, forexSortOrder])
  
  // Kripto sıralama değiştiğinde displayed count'ı sıfırla
  useEffect(() => {
    setDisplayedCrypto(50)
  }, [cryptoSortBy, cryptoSortOrder])
  
  // Emtia sıralama değiştiğinde displayed count'ı sıfırla
  useEffect(() => {
    setDisplayedCommodities(50)
  }, [commoditySortBy, commoditySortOrder])
  
  // Arama yapıldığında displayed count'ları sıfırla
  useEffect(() => {
    setDisplayedForex(50)
  }, [searchForex])
  
  useEffect(() => {
    setDisplayedCrypto(50)
  }, [searchCrypto])
  
  useEffect(() => {
    setDisplayedStocks(50)
  }, [searchStocks])
  
  useEffect(() => {
    setDisplayedCommodities(50)
  }, [searchCommodities])

  const loadMarketData = async () => {

    try {
      setLoading(true)
      const [forexResponse, crypto, stocks, commodities, indices] = await Promise.all([
        marketApi.getForexData(),
        marketApi.getCryptoData(),
        marketApi.getStockData(),
        marketApi.getCommodityData(),
        marketApi.getBistIndices(),
      ])
      
      // TCMB döviz kurları tarih bilgisini kaydet
      const forex = Array.isArray(forexResponse?.data) ? forexResponse.data : []
      setForexDate(forexResponse?.date || null)
      
      // BIST endeks bilgilerini kaydet
      setBistIndices(indices)
      
      // BIST endeks bilgilerini kaydet
      setBistIndices(indices)
      
      // Fiyat değişikliklerini tespit et ve animasyon ekle (ilk yüklemede değil)
      const allData = [...forex, ...crypto, ...stocks, ...commodities]
      const newAnimations: Record<string, 'up' | 'down' | null> = {}
      
      if (!isFirstLoadRef.current) {
        // İlk yükleme değilse animasyonları kontrol et
        allData.forEach(item => {
          const key = `${item.category}-${item.symbol}`
          const prevPrice = prevPricesRef.current[key]
          
          if (prevPrice !== undefined && prevPrice !== item.price) {
            const direction = item.price > prevPrice ? 'up' : 'down'
            newAnimations[key] = direction
            
            // 3 saniye sonra animasyonu kaldır
            setTimeout(() => {
              setPriceChangeAnimations(prev => {
                const updated = { ...prev }
                delete updated[key]
                return updated
              })
            }, 3000)
          }
        })
        
        // Yeni animasyonları ekle
        if (Object.keys(newAnimations).length > 0) {
          setPriceChangeAnimations(prev => ({ ...prev, ...newAnimations }))
        }
      } else {
        // İlk yükleme tamamlandı, bir sonraki yüklemeden itibaren animasyonları göster
        isFirstLoadRef.current = false
      }
  
      // Önceki fiyatları güncelle (ref'e kaydet, böylece bir sonraki yüklemede kullanılabilir)
      const newPrevPrices: Record<string, number> = {}
      allData.forEach(item => {
        const key = `${item.category}-${item.symbol}`
        newPrevPrices[key] = item.price
      })
      prevPricesRef.current = newPrevPrices
      
      setForexData(forex)
      setCryptoData(crypto)
      setStockData(stocks)
      setCommodityData(commodities)
    } catch (error: any) {
      console.error('Piyasa verileri yüklenemedi:', error)
      toast.error('Piyasa verileri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }
  
  // Fiyat değişim animasyon class'ını al
  const getPriceAnimationClass = (item: MarketDataItem) => {
    const key = `${item.category}-${item.symbol}`
    const animation = priceChangeAnimations[key]
    
    if (animation === 'up') {
      return 'animate-price-up'
    } else if (animation === 'down') {
      return 'animate-price-down'
    }
    return ''
  }

  const formatPrice = (item: MarketDataItem) => {
    if (item.category === 'crypto') {
      return `$${item.price.toLocaleString('en-US', { maximumFractionDigits: 12 })}`
    } else if (item.category === 'commodity') {
      if (item.symbol === 'ONS_ALTIN') {
        return `$${item.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
      }
      return `₺${item.price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`
    } else if (item.category === 'stock') {
      return item.price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })
    } else {
      // Forex
      return item.price.toLocaleString('tr-TR', { maximumFractionDigits: 4 })
    }
  }

  const formatChange = (changePercent: number) => {
    const sign = changePercent >= 0 ? '+' : ''
    return `${sign}${changePercent.toFixed(2)}%`
  }

  const getSymbolSlug = (item: MarketDataItem) => {
    if (item.category === 'forex') {
      return item.symbol.toLowerCase().replace(/\//g, '-')
    } else if (item.category === 'crypto') {
      return `${item.symbol.toLowerCase()}-usd`
    } else if (item.category === 'commodity') {
      return item.symbol.toLowerCase().replace(/_/g, '-')
    } else {
      return item.symbol.toLowerCase()
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Canlı Piyasa Verileri</h1>
        <p className="text-lg text-(--color-foreground-muted)">
          Döviz, kripto para, borsa ve emtia fiyatlarını anlık takip edin
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto">
            <TabsTrigger value="forex">
              <DollarSign className="mr-2 h-4 w-4" />
              Döviz
            </TabsTrigger>
            <TabsTrigger value="crypto">
              <Bitcoin className="mr-2 h-4 w-4" />
              Kripto
            </TabsTrigger>
            <TabsTrigger value="stocks">
              <Building2 className="mr-2 h-4 w-4" />
              Borsa
            </TabsTrigger>
            <TabsTrigger value="commodities">
              <Coins className="mr-2 h-4 w-4" />
              Emtia
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Arama çubuğu - her tab için */}
        <div className="relative">
          {activeTab === "forex" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Döviz ara (örn: USD, EUR, GBP)..."
                value={searchForex}
                onChange={(e) => setSearchForex(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          {activeTab === "crypto" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Kripto ara (örn: BTC, ETH, SOL)..."
                value={searchCrypto}
                onChange={(e) => setSearchCrypto(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          {activeTab === "stocks" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Hisse senedi ara (örn: THYAO, GARAN)..."
                value={searchStocks}
                onChange={(e) => setSearchStocks(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          {activeTab === "commodities" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Emtia ara (örn: Altın, Gümüş)..."
                value={searchCommodities}
                onChange={(e) => setSearchCommodities(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
        </div>

        <TabsContent value="forex" className="space-y-4">
          <Tabs value={forexSource} onValueChange={(value) => setForexSource(value as 'tcmb' | 'market')} className="w-full sm:w-auto">
          {/* TCMB/Piyasa Alt Tab'ları */}   
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <TabsList className="grid w-full sm:w-auto grid-cols-3 sm:grid-cols-2 h-auto">
                <TabsTrigger value="tcmb" className="text-xs sm:text-sm">TCMB</TabsTrigger>
                <TabsTrigger value="market" className="text-xs sm:text-sm">Piyasa</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="tcmb" className="space-y-4 mt-4">
              {/* TCMB Tarih Bilgisi */}
              {forexDate && (
                <div className="text-sm text-(--color-foreground-muted) text-center py-2 bg-(--color-surface) rounded-md">
                  TCMB Döviz Kurları - {new Date(forexDate).toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </div>
              )}
              
              {/* Döviz Sıralama */}
              {forexData.length > 0 && (
                <div className="flex items-center justify-end gap-2">
                  <Select
                    value={forexSortBy}
                    onValueChange={(value) => {
                      setForexSortBy(value as "none" | "name" | "price")
                      if (value !== "none") {
                        setForexSortOrder("desc")
                      }
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        <SelectValue placeholder="Sırala" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sıralama Yok</SelectItem>
                      <SelectItem value="name">İsme Göre</SelectItem>
                      <SelectItem value="price">Fiyata Göre</SelectItem>
                    </SelectContent>
                  </Select>
                  {forexSortBy !== "none" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setForexSortOrder(forexSortOrder === "asc" ? "desc" : "asc")}
                      className="px-3"
                    >
                      {forexSortOrder === "asc" ? "↑" : "↓"}
                    </Button>
                  )}
                </div>
              )}
              {loading && forexData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : forexData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-(--color-foreground-muted)">Döviz verileri yüklenemedi</p>
              </CardContent>
            </Card>
          ) : filteredForex.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-(--color-foreground-muted)">Arama sonucu bulunamadı</p>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedForexData.map((item) => {
                  const favoriteKey = getFavoriteKey(item.symbol, 'forex')
                  const isFavorite = favoriteStatuses[favoriteKey] || false
                  const isLoading = favoriteLoading[favoriteKey] || false
                  return (
                  <div key={item.symbol} className="relative">
                    <Link href={`/piyasalar/${getSymbolSlug(item)}`}>
                      <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{item.symbol}</CardTitle>
                              {item.name && <CardDescription>{item.name}</CardDescription>}
                            </div>
                            <span
                              className={`flex items-center gap-1 text-sm font-semibold ${
                                item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
                              }`}
                            >
                              {item.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              {formatChange(item.changePercent)}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className={`text-2xl font-bold rounded px-1 ${getPriceAnimationClass(item)}`}>{formatPrice(item)}</div>
                            {item.metadata?.buy && item.metadata?.sell && (
                              <div className="flex justify-between text-sm text-(--color-foreground-muted)">
                                <span>Alış: {item.metadata.buy.toFixed(4)}</span>
                                <span>Satış: {item.metadata.sell.toFixed(4)}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 z-10"
                      onClick={(e) => handleToggleFavorite(e, item)}
                      disabled={isLoading}
                    >
                      <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                    </Button>
                  </div>
                  )
                })}
              </div>
              {displayedForex < filteredForex.length && (
                <div ref={loadMoreForexRef} className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </>
          ) : (
            <Card className="overflow-hidden py-0">
              <CardContent className="p-0">
                <div className="divide-y divide-(--color-border)">
                  {/* Tablo Başlığı */}
                  <div className="hidden md:grid grid-cols-12 gap-2 p-2 bg-(--color-surface) text-xs font-semibold text-(--color-foreground-muted) sticky top-0 z-10">
                    <div className="col-span-4 md:col-span-3">Döviz</div>
                    <div className="col-span-4 md:col-span-2 text-right">Fiyat</div>
                    <div className="col-span-2 md:col-span-2 text-right hidden lg:block">Alış</div>
                    <div className="col-span-2 md:col-span-2 text-right hidden lg:block">Satış</div>
                    <div className="col-span-2 md:col-span-2 text-right">% Fark</div>
                    <div className="col-span-1 md:col-span-1"></div>
                  </div>
                  {displayedForexData.map((item) => {
                    const favoriteKey = getFavoriteKey(item.symbol, 'forex')
                    const isFavorite = favoriteStatuses[favoriteKey] || false
                    const isLoading = favoriteLoading[favoriteKey] || false
                    return (
                    <Link
                      key={item.symbol}
                      href={`/piyasalar/${getSymbolSlug(item)}`}
                      className="grid grid-cols-12 gap-2 p-2 hover:bg-(--color-surface) transition-colors text-sm cursor-pointer"
                    >
                      <div className="col-span-4 md:col-span-3 font-semibold">{item.name || item.symbol}</div>
                      <div className={`col-span-4 md:col-span-2 text-right font-bold rounded px-1 ${getPriceAnimationClass(item)}`}>{formatPrice(item)}</div>
                      <div className="hidden lg:block col-span-2 text-right text-(--color-foreground-muted)">
                        {item.metadata?.buy ? item.metadata.buy.toFixed(4) : '-'}
                      </div>
                      <div className="hidden lg:block col-span-2 text-right text-(--color-foreground-muted)">
                        {item.metadata?.sell ? item.metadata.sell.toFixed(4) : '-'}
                      </div>
                      <div className={`col-span-2 md:col-span-2 text-right font-semibold flex items-center justify-end gap-1 ${
                        item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
                      }`}>
                        {item.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {formatChange(item.changePercent)}
                      </div>
                      <div className="col-span-1 md:col-span-1 flex items-center justify-center" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleToggleFavorite(e, item)}
                          disabled={isLoading}
                        >
                          <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                        </Button>
                      </div>
                      {/* Mobilde detayları göster */}
                      <div className="md:hidden col-span-12 mt-2 pt-2 border-t border-(--color-border) text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          {item.metadata?.buy && (
                            <div>
                              <span className="text-(--color-foreground-muted)">Alış: </span>
                              <span className="font-semibold">{item.metadata.buy.toFixed(4)}</span>
                            </div>
                          )}
                          {item.metadata?.sell && (
                            <div>
                              <span className="text-(--color-foreground-muted)">Satış: </span>
                              <span className="font-semibold">{item.metadata.sell.toFixed(4)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  )})}
                  {displayedForex < filteredForex.length && (
                    <div ref={loadMoreForexRef} className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
            </TabsContent>
            
            <TabsContent value="market" className="space-y-4 mt-4">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-(--color-foreground-muted)">Piyasa döviz kurları yakında eklenecek</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="crypto" className="space-y-4">
          {/* Kripto Sıralama */}
          {cryptoData.length > 0 && (
            <div className="flex items-center justify-end gap-2">
              <Select
                value={cryptoSortBy}
                onValueChange={(value) => {
                  setCryptoSortBy(value as "none" | "name" | "price")
                  if (value !== "none") {
                    setCryptoSortOrder("desc")
                  }
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    <SelectValue placeholder="Sırala" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sıralama Yok</SelectItem>
                  <SelectItem value="name">İsme Göre</SelectItem>
                  <SelectItem value="price">Fiyata Göre</SelectItem>
                </SelectContent>
              </Select>
              {cryptoSortBy !== "none" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCryptoSortOrder(cryptoSortOrder === "asc" ? "desc" : "asc")}
                  className="px-3"
                >
                  {cryptoSortOrder === "asc" ? "↑" : "↓"}
                </Button>
              )}
            </div>
          )}
          {loading && cryptoData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : cryptoData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-(--color-foreground-muted)">Kripto verileri yüklenemedi</p>
              </CardContent>
            </Card>
          ) : filteredCrypto.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-(--color-foreground-muted)">Arama sonucu bulunamadı</p>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedCryptoData.map((item) => {
                  const favoriteKey = getFavoriteKey(item.symbol, 'crypto')
                  const isFavorite = favoriteStatuses[favoriteKey] || false
                  const isLoading = favoriteLoading[favoriteKey] || false
                  return (
                  <div key={item.symbol} className="relative">
                    <Link href={`/piyasalar/${getSymbolSlug(item)}`}>
                      <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{item.symbol}</CardTitle>
                              {item.name && <CardDescription>{item.name}</CardDescription>}
                            </div>
                            <span
                              className={`flex items-center gap-1 text-sm font-semibold ${
                                item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
                              }`}
                            >
                              {item.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              {formatChange(item.changePercent)}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className={`text-2xl font-bold rounded px-1 ${getPriceAnimationClass(item)}`}>{formatPrice(item)}</div>
                            {item.metadata?.marketCap && (
                              <div className="text-sm text-(--color-foreground-muted)">Piyasa Değeri: {item.metadata.marketCap}</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 z-10"
                      onClick={(e) => handleToggleFavorite(e, item)}
                      disabled={isLoading}
                    >
                      <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                    </Button>
                  </div>
                  )
                })}
              </div>
              {displayedCrypto < filteredCrypto.length && (
                <div ref={loadMoreCryptoRef} className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </>
          ) : (
            <Card className="overflow-hidden py-0">
              <CardContent className="p-0">
                <div className="divide-y divide-(--color-border)">
                  {/* Tablo Başlığı */}
                  <div className="hidden md:grid grid-cols-12 gap-1 p-2 bg-(--color-surface) text-xs font-semibold text-(--color-foreground-muted) sticky top-0 z-10">
                    <div className="col-span-4 md:col-span-4">Kripto</div>
                    <div className="col-span-2 md:col-span-2 text-right">Fiyat</div>
                    <div className="col-span-3 md:col-span-3 text-right hidden lg:block">Piyasa Değeri</div>
                    <div className="col-span-3 md:col-span-3 text-right">% Fark</div>
                  </div>
                  {displayedCryptoData.map((item) => (
                    <Link
                      key={item.symbol}
                      href={`/piyasalar/${getSymbolSlug(item)}`}
                      className="grid grid-cols-12 gap-1 p-2 hover:bg-(--color-surface) transition-colors cursor-pointer text-sm"
                    >
                      <div className="col-span-4 md:col-span-4 font-semibold">{item.name || item.symbol}</div>
                      <div className={`col-span-2 md:col-span-2 text-right font-bold rounded px-1 ${getPriceAnimationClass(item)}`}>{formatPrice(item)}</div>
                      <div className="hidden lg:block col-span-3 text-right text-(--color-foreground-muted)">
                        {item.metadata?.marketCap || '-'}
                      </div>
                      <div className={`col-span-3 md:col-span-3 text-right font-semibold flex items-center justify-end gap-1 ${
                        item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
                      }`}>
                        {item.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {formatChange(item.changePercent)}
                      </div>
                      {/* Mobilde detayları göster */}
                      {item.metadata?.marketCap && (
                        <div className="md:hidden col-span-12 mt-2 pt-2 border-t border-(--color-border) text-xs">
                          <div>
                            <span className="text-(--color-foreground-muted)">Piyasa Değeri: </span>
                            <span className="font-semibold">{item.metadata.marketCap}</span>
                          </div>
                        </div>
                      )}
                    </Link>
                  ))}
                  {displayedCrypto < filteredCrypto.length && (
                    <div ref={loadMoreCryptoRef} className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stocks" className="space-y-4">
          {loading && stockData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : stockData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-(--color-foreground-muted)">Borsa verileri yüklenemedi</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* BIST Endeks Göstergeleri - Sağ Üstte */}
              {bistIndices.length > 0 && (
                <div className="flex flex-wrap gap-4 justify-end mb-4">
                  {bistIndices.map((index) => (
                    <div key={index.name} className="flex items-center gap-2 bg-(--color-surface) px-3 py-2 rounded-md">
                      <span className="text-sm font-semibold text-(--color-foreground-muted)">{index.name}:</span>
                      <span className="text-sm font-bold">{index.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span className={`text-xs font-semibold flex items-center gap-1 ${index.isUp ? 'text-(--color-success)' : 'text-(--color-danger)'}`}>
                        {index.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {index.isUp ? '+' : ''}{index.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* BIST Grup Filtreleme ve Sıralama */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* BIST Grup Tab'ları */}
                <Tabs value={selectedBistGroup} onValueChange={setSelectedBistGroup} className="w-full sm:w-auto">
                  <TabsList className="grid w-full sm:w-auto grid-cols-3 sm:grid-cols-4 h-auto">
                    <TabsTrigger value="all" className="text-xs sm:text-sm">Tümü</TabsTrigger>
                    <TabsTrigger value="BIST 100" className="text-xs sm:text-sm">BIST 100</TabsTrigger>
                    <TabsTrigger value="BIST 50" className="text-xs sm:text-sm">BIST 50</TabsTrigger>
                    <TabsTrigger value="BIST 30" className="text-xs sm:text-sm">BIST 30</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {/* Sıralama */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select
                    value={stockSortBy}
                    onValueChange={(value) => {
                      setStockSortBy(value as "none" | "name" | "price" | "volumeLot" | "volumeTL" | "change")
                      if (value !== "none") {
                        setStockSortOrder("desc")
                      }
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        <SelectValue placeholder="Sırala" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sıralama Yok</SelectItem>
                      <SelectItem value="name">İsme Göre</SelectItem>
                      <SelectItem value="price">Fiyata Göre</SelectItem>
                      <SelectItem value="volumeLot">Hacime Göre (Lot)</SelectItem>
                      <SelectItem value="volumeTL">Hacime Göre (TL)</SelectItem>
                      <SelectItem value="change">Farka Göre</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {stockSortBy !== "none" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStockSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                      className="px-3"
                    >
                      {stockSortOrder === "asc" ? "↑" : "↓"}
                    </Button>
                  )}
                </div>
              </div>
              
              {filteredStocks.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-(--color-foreground-muted)">Arama sonucu bulunamadı</p>
                  </CardContent>
                </Card>
              ) : viewMode === "grid" ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedStocksData.map((item) => {
                  const favoriteKey = getFavoriteKey(item.symbol, 'stock')
                  const isFavorite = favoriteStatuses[favoriteKey] || false
                  const isLoading = favoriteLoading[favoriteKey] || false
                  return (
                  <div key={item.symbol} className="relative">
                    <Link href={`/piyasalar/${getSymbolSlug(item)}`}>
                      <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{item.symbol}</CardTitle>
                              {item.name && <CardDescription>{item.name}</CardDescription>}
                            </div>
                            <span
                              className={`flex items-center gap-1 text-sm font-semibold ${
                                item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
                              }`}
                            >
                              {item.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              {formatChange(item.changePercent)}
                            </span>
                          </div>
                        </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-end justify-between gap-2">
                            <div className={`text-2xl font-bold rounded px-1 ${getPriceAnimationClass(item)}`}>{formatPrice(item)} ₺</div>
                            {item.metadata?.time && (
                              <div className="text-xs text-(--color-foreground-muted) pb-1">
                                {item.metadata.time}
                              </div>
                            )}
                          </div>
                          
                          {/* Alış/Satış/En Düşük - 3'lü */}
                          {(item.metadata?.buy || item.metadata?.sell || item.metadata?.low) && (
                            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-(--color-border)">
                              {item.metadata?.buy && (
                                <div>
                                  <div className="text-xs text-(--color-foreground-muted) mb-1">Alış</div>
                                  <div className="text-sm font-semibold">
                                    {item.metadata.buy.toFixed(2)} ₺
                                  </div>
                                </div>
                              )}
                              {item.metadata?.sell && (
                                <div>
                                  <div className="text-xs text-(--color-foreground-muted) mb-1">Satış</div>
                                  <div className="text-sm font-semibold">
                                    {item.metadata.sell.toFixed(2)} ₺
                                  </div>
                                </div>
                              )}
                              {item.metadata?.low && (
                                <div>
                                  <div className="text-xs text-(--color-foreground-muted) mb-1">En Düşük</div>
                                  <div className="text-sm font-semibold">
                                    {item.metadata.low.toFixed(2)} ₺
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* En Yüksek/Hacim (Lot)/Hacim (TL) - 3'lü */}
                          {(item.metadata?.high || item.metadata?.volume || item.metadata?.volumeTL) && (
                            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-(--color-border)">
                              {item.metadata?.high && (
                                <div>
                                  <div className="text-xs text-(--color-foreground-muted) mb-1">En Yüksek</div>
                                  <div className="text-sm font-semibold">
                                    {item.metadata.high.toFixed(2)} ₺
                                  </div>
                                </div>
                              )}
                              {item.metadata?.volume && (
                                <div>
                                  <div className="text-xs text-(--color-foreground-muted) mb-1">Hacim (Lot)</div>
                                  <div className="text-sm font-semibold">
                                    {item.metadata.volume.toLocaleString('tr-TR')}
                                  </div>
                                </div>
                              )}
                              {item.metadata?.volumeTL && (
                                <div>
                                  <div className="text-xs text-(--color-foreground-muted) mb-1">Hacim (TL)</div>
                                  <div className="text-sm font-semibold">
                                    {item.metadata.volumeTL.toLocaleString('tr-TR')}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 z-10"
                      onClick={(e) => handleToggleFavorite(e, item)}
                      disabled={isLoading}
                    >
                      <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                    </Button>
                  </div>
                  )
                })}
              </div>
              {displayedStocks < filteredStocks.length && (
                <div ref={loadMoreStocksRef} className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </>
          ) : (
            <Card className="overflow-hidden py-0">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <div className="min-w-[900px] divide-y divide-(--color-border)">
                    {/* Tablo Başlığı */}
                    <div className="grid grid-cols-12 gap-1 p-2 bg-(--color-surface) text-xs font-semibold text-(--color-foreground-muted) sticky top-0 z-10">
                      <div className="col-span-2 min-w-[100px]">Hisse</div>
                      <div className="col-span-1 min-w-[80px] text-right">Son</div>
                      <div className="col-span-1 min-w-[80px] text-right">Alış</div>
                      <div className="col-span-1 min-w-[80px] text-right">Satış</div>
                      <div className="col-span-1 min-w-[90px] text-right">En Düşük</div>
                      <div className="col-span-1 min-w-[90px] text-right">En Yüksek</div>
                      <div className="col-span-2 min-w-[120px] text-right">Hacim</div>
                      <div className="col-span-1 min-w-[80px] text-right">% Fark</div>
                      <div className="col-span-1 min-w-[60px] text-right">Saat</div>
                      <div className="col-span-1 min-w-[40px]"></div>
                    </div>
                    {displayedStocksData.map((item) => {
                      const favoriteKey = getFavoriteKey(item.symbol, 'stock')
                      const isFavorite = favoriteStatuses[favoriteKey] || false
                      const isLoading = favoriteLoading[favoriteKey] || false
                      return (
                      <Link
                        key={item.symbol}
                        href={`/piyasalar/${getSymbolSlug(item)}`}
                        className="grid grid-cols-12 gap-1 p-2 hover:bg-(--color-surface) transition-colors cursor-pointer text-sm"
                      >
                        <div className="col-span-2 min-w-[100px] font-semibold text-xs">{item.name || item.symbol}</div>
                        <div className={`col-span-1 min-w-[80px] text-right font-bold text-xs rounded px-1 ${getPriceAnimationClass(item)}`}>{formatPrice(item)} ₺</div>
                        <div className="col-span-1 min-w-[80px] text-right text-(--color-foreground-muted) text-xs">
                          {item.metadata?.buy ? `${item.metadata.buy.toFixed(2)} ₺` : '-'}
                        </div>
                        <div className="col-span-1 min-w-[80px] text-right text-(--color-foreground-muted) text-xs">
                          {item.metadata?.sell ? `${item.metadata.sell.toFixed(2)} ₺` : '-'}
                        </div>
                        <div className="col-span-1 min-w-[90px] text-right text-(--color-foreground-muted) text-xs">
                          {item.metadata?.low ? `${item.metadata.low.toFixed(2)} ₺` : '-'}
                        </div>
                        <div className="col-span-1 min-w-[90px] text-right text-(--color-foreground-muted) text-xs">
                          {item.metadata?.high ? `${item.metadata.high.toFixed(2)} ₺` : '-'}
                        </div>
                        <div className="col-span-2 min-w-[120px] text-right text-(--color-foreground-muted) text-xs leading-tight">
                          {item.metadata?.volume || item.metadata?.volumeTL ? (
                            <div className="flex flex-col gap-0 leading-none">
                              {item.metadata?.volume && (
                                <div className="leading-tight">Lot: {item.metadata.volume.toLocaleString('tr-TR')}</div>
                              )}
                              {item.metadata?.volumeTL && (
                                <div className="leading-tight">TL: {item.metadata.volumeTL.toLocaleString('tr-TR')} ₺</div>
                              )}
                            </div>
                          ) : '-'}
                        </div>
                        <div className={`col-span-1 min-w-[80px] text-right font-semibold flex items-center justify-end gap-1 text-xs ${
                          item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
                        }`}>
                          {item.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {formatChange(item.changePercent)}
                        </div>
                        <div className="col-span-1 min-w-[60px] text-right text-(--color-foreground-muted) text-xs">
                          {item.metadata?.time || '-'}
                        </div>
                        <div className="col-span-1 min-w-[40px] flex items-center justify-center" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => handleToggleFavorite(e, item)}
                            disabled={isLoading}
                          >
                            <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                          </Button>
                        </div>
                      </Link>
                      )
                    })}
                  {displayedStocks < filteredStocks.length && (
                    <div ref={loadMoreStocksRef} className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  </div>
                </div>
              </CardContent>
            </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="commodities" className="space-y-4">
          {/* Emtia Sıralama */}
          {commodityData.length > 0 && (
            <div className="flex items-center justify-end gap-2">
              <Select
                value={commoditySortBy}
                onValueChange={(value) => {
                  setCommoditySortBy(value as "none" | "name" | "price")
                  if (value !== "none") {
                    setCommoditySortOrder("desc")
                  }
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    <SelectValue placeholder="Sırala" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sıralama Yok</SelectItem>
                  <SelectItem value="name">İsme Göre</SelectItem>
                  <SelectItem value="price">Fiyata Göre</SelectItem>
                </SelectContent>
              </Select>
              {commoditySortBy !== "none" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommoditySortOrder(commoditySortOrder === "asc" ? "desc" : "asc")}
                  className="px-3"
                >
                  {commoditySortOrder === "asc" ? "↑" : "↓"}
                </Button>
              )}
            </div>
          )}
          {loading && commodityData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : commodityData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-(--color-foreground-muted)">Emtia verileri yüklenemedi</p>
              </CardContent>
            </Card>
          ) : filteredCommodities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-(--color-foreground-muted)">Arama sonucu bulunamadı</p>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedCommoditiesData.map((item) => {
                  const favoriteKey = getFavoriteKey(item.symbol, 'commodity')
                  const isFavorite = favoriteStatuses[favoriteKey] || false
                  const isLoading = favoriteLoading[favoriteKey] || false
                  return (
                  <div key={item.symbol} className="relative">
                    <Link href={`/piyasalar/${getSymbolSlug(item)}`}>
                      <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{item.name || item.symbol}</CardTitle>
                            <span
                              className={`flex items-center gap-1 text-sm font-semibold ${
                                item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
                              }`}
                            >
                              {item.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              {formatChange(item.changePercent)}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className={`text-2xl font-bold rounded px-1 ${getPriceAnimationClass(item)}`}>{formatPrice(item)}</div>
                            {item.metadata?.buy && item.metadata?.sell && (
                              <div className="flex justify-between text-sm text-(--color-foreground-muted)">
                                <span>Alış: {item.metadata.buy.toFixed(2)} ₺</span>
                                <span>Satış: {item.metadata.sell.toFixed(2)} ₺</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 z-10"
                      onClick={(e) => handleToggleFavorite(e, item)}
                      disabled={isLoading}
                    >
                      <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                    </Button>
                  </div>
                  )
                })}
              </div>
              {displayedCommodities < filteredCommodities.length && (
                <div ref={loadMoreCommoditiesRef} className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </>
          ) : (
            <Card className="overflow-hidden py-0">
              <CardContent className="p-0">
                <div className="divide-y divide-(--color-border)">
                  {/* Tablo Başlığı */}
                  <div className="hidden md:grid grid-cols-12 gap-1 p-2 bg-(--color-surface) text-xs font-semibold text-(--color-foreground-muted) sticky top-0 z-10">
                    <div className="col-span-4 md:col-span-4">Emtia</div>
                    <div className="col-span-2 md:col-span-2 text-right">Alış</div>
                    <div className="col-span-2 md:col-span-2 text-right">Satış</div>
                    <div className="col-span-3 md:col-span-3 text-right">% Fark</div>
                    <div className="col-span-1 md:col-span-1"></div>
                  </div>
                  {displayedCommoditiesData.map((item) => {
                    const favoriteKey = getFavoriteKey(item.symbol, 'commodity')
                    const isFavorite = favoriteStatuses[favoriteKey] || false
                    const isLoading = favoriteLoading[favoriteKey] || false
                    return (
                    <Link
                      key={item.symbol}
                      href={`/piyasalar/${getSymbolSlug(item)}`}
                      className="grid grid-cols-12 gap-1 p-2 hover:bg-(--color-surface) transition-colors cursor-pointer text-sm"
                    >
                      <div className="col-span-4 md:col-span-4 font-semibold">{item.name || item.symbol}</div>
                      <div className={`col-span-2 md:col-span-2 text-right font-bold text-xs rounded px-1 ${getPriceAnimationClass(item)}`}>
                        {item.metadata?.buy ? `${item.metadata.buy.toFixed(2)} ₺` : '-'}
                      </div>
                      <div className={`col-span-2 md:col-span-2 text-right font-bold text-xs rounded px-1 ${getPriceAnimationClass(item)}`}>
                        {item.metadata?.sell ? `${item.metadata.sell.toFixed(2)} ₺` : '-'}
                      </div>
                      <div className={`col-span-3 md:col-span-3 text-right font-semibold flex items-center justify-end gap-1 text-xs ${
                        item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
                      }`}>
                        {item.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {formatChange(item.changePercent)}
                      </div>
                      <div className="col-span-1 md:col-span-1 flex items-center justify-center" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleToggleFavorite(e, item)}
                          disabled={isLoading}
                        >
                          <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                        </Button>
                      </div>
                    </Link>
                    )
                  })}
                  {displayedCommodities < filteredCommodities.length && (
                    <div ref={loadMoreCommoditiesRef} className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card className="mt-8 bg-(--color-surface)">
        <CardHeader>
          <CardTitle>Piyasa Verileri Hakkında</CardTitle>
        </CardHeader>
        <CardContent className="text-(--color-foreground-muted)">
          <p>
            Bu sayfadaki piyasa verileri bilgilendirme amaçlıdır. Gerçek zamanlı veriler için lütfen resmi piyasa
            kaynaklarını kontrol edin. Fiyatlar ve değişim oranları anlık güncellenebilir.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
