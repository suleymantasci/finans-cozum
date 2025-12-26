"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Euro, Bitcoin, Loader2 } from "lucide-react"
import { MarketDataItem } from "@/lib/market-api"
import { useMarketData } from "@/contexts/market-data-context"

export function MarketOverview() {
  const { tickerData: marketData, isLoading: loading } = useMarketData()

  // İstenen sembolleri bul
  const getItemBySymbol = (symbol: string): MarketDataItem | undefined => {
    return marketData.find(item => item.symbol === symbol || item.symbol.startsWith(symbol))
  }

  const usdTry = getItemBySymbol('USD/TRY')
  const eurTry = getItemBySymbol('EUR/TRY')
  const btc = getItemBySymbol('BTC')
  const gramAltin = getItemBySymbol('GRAM_ALTIN')

  const formatPrice = (item: MarketDataItem | undefined) => {
    if (!item) return '--'
    
    if (item.category === 'crypto') {
      return `$${item.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    } else if (item.category === 'commodity') {
      return `₺${item.price.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`
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

  const displayData = [
    {
      title: "USD/TRY",
      value: formatPrice(usdTry),
      change: formatChange(usdTry),
      isUp: usdTry?.isUp ?? false,
      icon: DollarSign,
    },
    {
      title: "EUR/TRY",
      value: formatPrice(eurTry),
      change: formatChange(eurTry),
      isUp: eurTry?.isUp ?? false,
      icon: Euro,
    },
    {
      title: "Bitcoin",
      value: formatPrice(btc),
      change: formatChange(btc),
      isUp: btc?.isUp ?? false,
      icon: Bitcoin,
    },
    {
      title: gramAltin?.name || "Gram Altın",
      value: formatPrice(gramAltin),
      change: formatChange(gramAltin),
      isUp: gramAltin?.isUp ?? false,
      icon: TrendingUp,
    },
  ]

  return (
    <section className="bg-(--color-surface) py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Canlı Piyasa Özeti</h2>
          <p className="mx-auto max-w-2xl text-lg text-(--color-foreground-muted)">
            Döviz, kripto para ve emtia fiyatlarını anlık takip edin
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading && marketData.length === 0 ? (
            // Loading state
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={`loading-${index}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Yükleniyor...</CardTitle>
                  <Loader2 className="h-4 w-4 animate-spin text-(--color-foreground-muted)" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <div className="flex items-center gap-1 text-xs text-(--color-foreground-muted)">
                    <span>Yükleniyor...</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            displayData.map((item) => (
              <Card key={item.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                  <item.icon className="h-4 w-4 text-(--color-foreground-muted)" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="flex items-center gap-1 text-xs">
                    {item.change !== '--' && (
                      <>
                        {item.isUp ? (
                          <TrendingUp className="h-3 w-3 text-(--color-success)" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-(--color-danger)" />
                        )}
                        <span className={item.isUp ? "text-(--color-success)" : "text-(--color-danger)"}>{item.change}</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
