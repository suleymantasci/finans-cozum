"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, Building2, Coins, LayoutGrid, List } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Link from "next/link"

const forexData = [
  { pair: "USD/TRY", price: "34.25", change: "+0.45%", isUp: true, buy: "34.20", sell: "34.30" },
  { pair: "EUR/TRY", price: "37.82", change: "+0.32%", isUp: true, buy: "37.77", sell: "37.87" },
  { pair: "GBP/TRY", price: "43.65", change: "+0.18%", isUp: true, buy: "43.58", sell: "43.72" },
  { pair: "CHF/TRY", price: "38.92", change: "-0.12%", isUp: false, buy: "38.85", sell: "38.99" },
  { pair: "CAD/TRY", price: "24.15", change: "+0.25%", isUp: true, buy: "24.10", sell: "24.20" },
  { pair: "AUD/TRY", price: "22.34", change: "-0.08%", isUp: false, buy: "22.28", sell: "22.40" },
]

const cryptoData = [
  { symbol: "BTC", name: "Bitcoin", price: "$95,450", change: "-1.25%", isUp: false, marketCap: "$1.87T" },
  { symbol: "ETH", name: "Ethereum", price: "$3,625", change: "+2.18%", isUp: true, marketCap: "$435B" },
  { symbol: "BNB", name: "Binance Coin", price: "$682", change: "+1.45%", isUp: true, marketCap: "$102B" },
  { symbol: "XRP", name: "Ripple", price: "$2.15", change: "+3.82%", isUp: true, marketCap: "$122B" },
  { symbol: "ADA", name: "Cardano", price: "$1.08", change: "-0.95%", isUp: false, marketCap: "$38B" },
  { symbol: "SOL", name: "Solana", price: "$178", change: "+4.25%", isUp: true, marketCap: "$82B" },
]

const stockData = [
  { symbol: "XU100", name: "BIST 100", price: "9,856", change: "-0.52%", isUp: false },
  { symbol: "THYAO", name: "Türk Hava Yolları", price: "325.50", change: "+1.25%", isUp: true },
  { symbol: "AKBNK", name: "Akbank", price: "68.75", change: "+0.85%", isUp: true },
  { symbol: "GARAN", name: "Garanti BBVA", price: "125.20", change: "-0.42%", isUp: false },
  { symbol: "TUPRS", name: "Tüpraş", price: "198.40", change: "+2.15%", isUp: true },
  { symbol: "EREGL", name: "Ereğli Demir Çelik", price: "52.30", change: "-1.05%", isUp: false },
]

const commodityData = [
  { name: "Gram Altın", price: "₺2,845", change: "+0.85%", isUp: true },
  { name: "Çeyrek Altın", price: "₺4,678", change: "+0.85%", isUp: true },
  { name: "Cumhuriyet Altını", price: "₺18,920", change: "+0.85%", isUp: true },
  { name: "Ons Altın", price: "$2,654", change: "+0.62%", isUp: true },
  { name: "Gümüş (Ons)", price: "$30.45", change: "+1.25%", isUp: true },
  { name: "Brent Petrol", price: "$74.25", change: "-0.35%", isUp: false },
]

export default function MarketsClientPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Canlı Piyasa Verileri</h1>
        <p className="text-lg text-(--color-foreground-muted)">
          Döviz, kripto para, borsa ve emtia fiyatlarını anlık takip edin
        </p>
      </div>

      <Tabs defaultValue="forex" className="space-y-6">
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

        <TabsContent value="forex" className="space-y-4">
          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {forexData.map((item) => (
                <Link key={item.pair} href={`/piyasalar/${item.pair.toLowerCase().replace(/\//g, "-")}`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{item.pair}</CardTitle>
                        <span
                          className={`flex items-center gap-1 text-sm font-semibold ${
                            item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
                          }`}
                        >
                          {item.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {item.change}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">{item.price}</div>
                        <div className="flex justify-between text-sm text-(--color-foreground-muted)">
                          <span>Alış: {item.buy}</span>
                          <span>Satış: {item.sell}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-(--color-border)">
                  {forexData.map((item) => (
                    <Link
                      key={item.pair}
                      href={`/piyasalar/${item.pair.toLowerCase().replace(/\//g, "-")}`}
                      className="flex items-center justify-between p-4 hover:bg-(--color-surface) transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="font-semibold min-w-[80px]">{item.pair}</div>
                        <div className="text-xl font-bold">{item.price}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-sm text-(--color-foreground-muted) hidden sm:flex gap-4">
                          <span>Alış: {item.buy}</span>
                          <span>Satış: {item.sell}</span>
                        </div>
                        <span
                          className={`flex items-center gap-1 text-sm font-semibold min-w-[70px] justify-end ${
                            item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
                          }`}
                        >
                          {item.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {item.change}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="crypto" className="space-y-4">
          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cryptoData.map((item) => (
                <Link key={item.symbol} href={`/piyasalar/${item.symbol.toLowerCase()}-usd`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.symbol}</CardTitle>
                          <CardDescription>{item.name}</CardDescription>
                        </div>
                        <span
                          className={`flex items-center gap-1 text-sm font-semibold ${
                            item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
                          }`}
                        >
                          {item.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {item.change}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">{item.price}</div>
                        <div className="text-sm text-(--color-foreground-muted)">Piyasa Değeri: {item.marketCap}</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-(--color-border)">
                  {cryptoData.map((item) => (
                    <Link
                      key={item.symbol}
                      href={`/piyasalar/${item.symbol.toLowerCase()}-usd`}
                      className="flex items-center justify-between p-4 hover:bg-(--color-surface) transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div>
                          <div className="font-semibold">{item.symbol}</div>
                          <div className="text-sm text-(--color-foreground-muted)">{item.name}</div>
                        </div>
                        <div className="text-xl font-bold">{item.price}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-sm text-(--color-foreground-muted) hidden md:block">{item.marketCap}</div>
                        <span
                          className={`flex items-center gap-1 text-sm font-semibold min-w-[70px] justify-end ${
                            item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
                          }`}
                        >
                          {item.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {item.change}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stocks" className="space-y-4">
          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stockData.map((item) => (
                <Link key={item.symbol} href={`/piyasalar/${item.symbol.toLowerCase()}`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.symbol}</CardTitle>
                          <CardDescription>{item.name}</CardDescription>
                        </div>
                        <span
                          className={`flex items-center gap-1 text-sm font-semibold ${
                            item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
                          }`}
                        >
                          {item.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {item.change}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{item.price}</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-(--color-border)">
                  {stockData.map((item) => (
                    <Link
                      key={item.symbol}
                      href={`/piyasalar/${item.symbol.toLowerCase()}`}
                      className="flex items-center justify-between p-4 hover:bg-(--color-surface) transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div>
                          <div className="font-semibold">{item.symbol}</div>
                          <div className="text-sm text-(--color-foreground-muted)">{item.name}</div>
                        </div>
                        <div className="text-xl font-bold">{item.price}</div>
                      </div>
                      <span
                        className={`flex items-center gap-1 text-sm font-semibold min-w-[70px] justify-end ${
                          item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
                        }`}
                      >
                        {item.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {item.change}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="commodities" className="space-y-4">
          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {commodityData.map((item) => (
                <Link
                  key={item.name}
                  href={`/piyasalar/${item.name.toLowerCase().replace(/\s/g, "-").replace(/ı/g, "i")}`}
                >
                  <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <span
                          className={`flex items-center gap-1 text-sm font-semibold ${
                            item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
                          }`}
                        >
                          {item.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {item.change}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{item.price}</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-(--color-border)">
                  {commodityData.map((item) => (
                    <Link
                      key={item.name}
                      href={`/piyasalar/${item.name.toLowerCase().replace(/\s/g, "-").replace(/ı/g, "i")}`}
                      className="flex items-center justify-between p-4 hover:bg-(--color-surface) transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="font-semibold min-w-[140px]">{item.name}</div>
                        <div className="text-xl font-bold">{item.price}</div>
                      </div>
                      <span
                        className={`flex items-center gap-1 text-sm font-semibold min-w-[70px] justify-end ${
                          item.isUp ? "text-(--color-success)" : "text-(--color-danger)"
                        }`}
                      >
                        {item.isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {item.change}
                      </span>
                    </Link>
                  ))}
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
