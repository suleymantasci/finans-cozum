"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowDownUp, TrendingUp } from "lucide-react"

// Mock exchange rates - gerçek API entegrasyonu ile değiştirilecek
const exchangeRates: Record<string, number> = {
  USD: 34.25,
  EUR: 37.82,
  GBP: 43.65,
  CHF: 38.92,
  CAD: 24.15,
  AUD: 22.34,
  SAR: 9.13,
  JPY: 0.23,
}

const currencies = [
  { code: "TRY", name: "Türk Lirası", flag: "🇹🇷" },
  { code: "USD", name: "Amerikan Doları", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "İngiliz Sterlini", flag: "🇬🇧" },
  { code: "CHF", name: "İsviçre Frangı", flag: "🇨🇭" },
  { code: "CAD", name: "Kanada Doları", flag: "🇨🇦" },
  { code: "AUD", name: "Avustralya Doları", flag: "🇦🇺" },
  { code: "SAR", name: "Suudi Riyali", flag: "🇸🇦" },
  { code: "JPY", name: "Japon Yeni", flag: "🇯🇵" },
]

export function CurrencyConverter() {
  const [amount, setAmount] = useState("1000")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("TRY")
  const [result, setResult] = useState<number | null>(null)

  const convertCurrency = () => {
    const amountValue = Number.parseFloat(amount)

    if (fromCurrency === "TRY" && toCurrency !== "TRY") {
      // TRY'den diğer para birimlerine
      setResult(amountValue / exchangeRates[toCurrency])
    } else if (fromCurrency !== "TRY" && toCurrency === "TRY") {
      // Diğer para birimlerinden TRY'ye
      setResult(amountValue * exchangeRates[fromCurrency])
    } else if (fromCurrency === "TRY" && toCurrency === "TRY") {
      setResult(amountValue)
    } else {
      // Diğer para birimleri arası
      const tryAmount = amountValue * exchangeRates[fromCurrency]
      setResult(tryAmount / exchangeRates[toCurrency])
    }
  }

  const swapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    setResult(null)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Para Birimi Çevirici</CardTitle>
          <CardDescription>Anlık kurlarla döviz çevirisi yapın</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* From Currency */}
          <div className="space-y-2">
            <Label>Çevrilecek Miktar</Label>
            <div className="grid gap-2 sm:grid-cols-[1fr_200px]">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                className="text-lg"
              />
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.flag} {curr.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button variant="outline" size="icon" onClick={swapCurrencies}>
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <Label>Dönüştürülecek Para Birimi</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={convertCurrency} className="w-full" size="lg">
            Çevir
          </Button>

          {/* Result */}
          {result !== null && (
            <div className="rounded-lg border-2 border-(--color-success) bg-(--color-success)/5 p-6">
              <div className="text-sm text-(--color-foreground-muted)">Sonuç</div>
              <div className="text-3xl font-bold text-(--color-success)">
                {formatNumber(result)} {toCurrency}
              </div>
              <div className="mt-2 text-sm text-(--color-foreground-muted)">
                {formatNumber(Number.parseFloat(amount))} {fromCurrency} = {formatNumber(result)} {toCurrency}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exchange Rates Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Güncel Kurlar
          </CardTitle>
          <CardDescription>TRY bazında döviz kurları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(exchangeRates).map(([code, rate]) => {
              const currency = currencies.find((c) => c.code === code)
              return (
                <div key={code} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currency?.flag}</span>
                    <span className="font-semibold">{code}</span>
                  </div>
                  <span className="font-mono font-semibold">₺{formatNumber(rate)}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
