"use client"

import { TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { MarketDataItem } from "@/lib/market-api"
import { useMarketData } from "@/contexts/market-data-context"

export function LiveMarketTicker() {
  const { tickerData: marketData, isLoading: loading } = useMarketData()

  const formatPrice = (item: MarketDataItem) => {
    if (item.category === 'crypto') {
      return `$${item.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
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

  const getDisplayName = (item: MarketDataItem) => {
    // Altın/emtia için name değerini kullan, diğerleri için symbol
    if (item.category === 'commodity') {
      const goldSymbols = ['GRAM_ALTIN', 'CEYREK_YENI', 'CEYREK_ALTIN', 'TAM_YENI', 'TAM_ALTIN', 'HAS_ALTIN', 'GRAM_GUMUS']
      if (goldSymbols.includes(item.symbol)) {
        return item.name || item.symbol
      }
    }
    return item.symbol
  }

  if (loading && marketData.length === 0) {
    return (
      <div className="border-b bg-(--color-surface) overflow-hidden">
        <div className="flex items-center justify-center gap-2 py-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-(--color-foreground-muted)">Piyasa verileri yükleniyor...</span>
        </div>
      </div>
    )
  }

  if (marketData.length === 0) {
    return null
  }

  return (
    <div className="border-b bg-(--color-surface) overflow-hidden">
      <div className="flex animate-ticker gap-8 py-3">
        {/* İlk Set */}
        {marketData.map((item, index) => (
          <div key={`first-${index}`} className="flex items-center gap-2 whitespace-nowrap px-4">
            <span className="font-semibold">{getDisplayName(item)}</span>
            <span className="text-(--color-foreground-muted)">{formatPrice(item)}</span>
            <span
              className={`flex items-center gap-1 text-sm ${
                item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
              }`}
            >
              {item.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {formatChange(item.changePercent)}
            </span>
          </div>
        ))}
        {/* Duplicate Set için seamless loop */}
        {marketData.map((item, index) => (
          <div key={`second-${index}`} className="flex items-center gap-2 whitespace-nowrap px-4">
            <span className="font-semibold">{getDisplayName(item)}</span>
            <span className="text-(--color-foreground-muted)">{formatPrice(item)}</span>
            <span
              className={`flex items-center gap-1 text-sm ${
                item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
              }`}
            >
              {item.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {formatChange(item.changePercent)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
