"use client"

import { TrendingUp, TrendingDown } from "lucide-react"

const mockMarketData = [
  { symbol: "USD/TRY", price: "34.25", change: "+0.45%", isUp: true },
  { symbol: "EUR/TRY", price: "37.82", change: "+0.32%", isUp: true },
  { symbol: "BTC", price: "$95,450", change: "-1.25%", isUp: false },
  { symbol: "ETH", price: "$3,625", change: "+2.18%", isUp: true },
  { symbol: "ALTIN", price: "₺2,845", change: "+0.85%", isUp: true },
  { symbol: "BIST 100", price: "9,856", change: "-0.52%", isUp: false },
]

export function LiveMarketTicker() {
  return (
    <div className="border-b bg-(--color-surface) overflow-hidden">
      <div className="flex animate-ticker gap-8 py-3">
        {/* İlk Set */}
        {mockMarketData.map((item, index) => (
          <div key={`first-${index}`} className="flex items-center gap-2 whitespace-nowrap px-4">
            <span className="font-semibold">{item.symbol}</span>
            <span className="text-(--color-foreground-muted)">{item.price}</span>
            <span
              className={`flex items-center gap-1 text-sm ${
                item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
              }`}
            >
              {item.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {item.change}
            </span>
          </div>
        ))}
        {/* Duplicate Set için seamless loop */}
        {mockMarketData.map((item, index) => (
          <div key={`second-${index}`} className="flex items-center gap-2 whitespace-nowrap px-4">
            <span className="font-semibold">{item.symbol}</span>
            <span className="text-(--color-foreground-muted)">{item.price}</span>
            <span
              className={`flex items-center gap-1 text-sm ${
                item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
              }`}
            >
              {item.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
