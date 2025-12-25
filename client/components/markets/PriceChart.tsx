"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Loader2 } from "lucide-react"
import { marketApi } from "@/lib/market-api"

interface PriceChartProps {
  symbol: string
  timeRange: string
  currentPrice: number
  isUp: boolean
}

const timeRangeToDays: Record<string, number> = {
  "1S": 7,
  "1G": 1,
  "1H": 30,
  "1A": 90,
  "3A": 180,
  "1Y": 365,
  "5Y": 1825,
  "Tümü": 365,
}

export function PriceChart({ symbol, timeRange, currentPrice, isUp }: PriceChartProps) {
  const [data, setData] = useState<Array<{ date: string; price: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChartData()
  }, [symbol, timeRange])

  const loadChartData = async () => {
    try {
      setLoading(true)
      const days = timeRangeToDays[timeRange] || 30
      const history = await marketApi.getMarketHistory(symbol, days)
      setData(history)
    } catch (error) {
      console.error('Grafik verileri yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground">
        Grafik verisi bulunamadı
      </div>
    )
  }

  // Tarih formatını kısalt
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (timeRange === "1G" || timeRange === "1S") {
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
    }
    return date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' })
  }

  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    price: item.price,
    fullDate: item.date,
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0.3} />
            <stop offset="95%" stopColor={isUp ? "#22c55e" : "#ef4444"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '12px' }}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '12px' }}
          domain={['auto', 'auto']}
          tickFormatter={(value) => {
            if (currentPrice > 1000) {
              return value.toFixed(0)
            } else if (currentPrice > 1) {
              return value.toFixed(2)
            }
            return value.toFixed(4)
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
          formatter={(value: number) => {
            if (currentPrice > 1000) {
              return [`₺${value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`, 'Fiyat']
            } else if (currentPrice > 1) {
              return [`₺${value.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`, 'Fiyat']
            }
            return [`₺${value.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}`, 'Fiyat']
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke={isUp ? "#22c55e" : "#ef4444"}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorPrice)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}


