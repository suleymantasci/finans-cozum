"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { marketApi, MarketDataItem } from "@/lib/market-api"
import { Loader2 } from "lucide-react"

interface RelatedMarketsProps {
  currentSymbol: string
  category: 'forex' | 'crypto' | 'stock' | 'commodity'
}

export function RelatedMarkets({ currentSymbol, category }: RelatedMarketsProps) {
  const [relatedMarkets, setRelatedMarkets] = useState<MarketDataItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRelatedMarkets()
  }, [category, currentSymbol])

  const loadRelatedMarkets = async () => {
    try {
      setLoading(true)
      let data: MarketDataItem[] = []

      switch (category) {
        case 'forex':
          const forexResponse = await marketApi.getForexData()
          data = Array.isArray(forexResponse?.data) ? forexResponse.data : []
          break
        case 'crypto':
          const cryptoData = await marketApi.getCryptoData()
          data = Array.isArray(cryptoData) ? cryptoData : []
          break
        case 'stock':
          const stockData = await marketApi.getStockData()
          data = Array.isArray(stockData) ? stockData : []
          break
        case 'commodity':
          const commodityData = await marketApi.getCommodityData()
          data = Array.isArray(commodityData) ? commodityData : []
          break
      }

      // Mevcut sembolü hariç tut ve en dikkat çeken 3'ü seç
      // Dikkat çekicilik: yüksek değişim yüzdesi veya yüksek hacim
      if (!Array.isArray(data)) {
        console.error('Piyasa verisi array değil:', data)
        data = []
      }

      const filtered = data
        .filter((item) => {
          const itemSlug = getSymbolSlug(item)
          return itemSlug !== currentSymbol.toLowerCase()
        })
        .sort((a, b) => {
          // Önce değişim yüzdesine göre sırala (mutlak değer)
          const aChange = Math.abs(a.changePercent)
          const bChange = Math.abs(b.changePercent)
          if (aChange !== bChange) {
            return bChange - aChange
          }
          // Sonra fiyata göre (yüksek fiyatlılar önce)
          return b.price - a.price
        })
        .slice(0, 3)

      setRelatedMarkets(filtered)
    } catch (error) {
      console.error('İlgili piyasalar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
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

  const formatPrice = (item: MarketDataItem) => {
    if (item.category === 'crypto') {
      return `$${item.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    } else if (item.category === 'commodity') {
      if (item.symbol === 'ONS_ALTIN' || item.symbol === 'ONS_GUMUS') {
        return `$${item.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
      }
      return `₺${item.price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`
    } else if (item.category === 'stock') {
      return item.price.toLocaleString('tr-TR', { maximumFractionDigits: 2 })
    } else {
      return item.price.toLocaleString('tr-TR', { maximumFractionDigits: 4 })
    }
  }

  const formatChange = (changePercent: number) => {
    const sign = changePercent >= 0 ? '+' : ''
    return `${sign}${changePercent.toFixed(2)}%`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>İlgili Piyasalar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (relatedMarkets.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>İlgili Piyasalar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {relatedMarkets.map((item) => (
          <Link
            key={item.symbol}
            href={`/piyasalar/${getSymbolSlug(item)}`}
            className="block p-3 rounded-lg border hover:bg-accent transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{item.symbol}</span>
                  {item.name && (
                    <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                  )}
                </div>
                <div className="text-lg font-bold">{formatPrice(item)}</div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    item.isUp ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.isUp ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {formatChange(item.changePercent)}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}


