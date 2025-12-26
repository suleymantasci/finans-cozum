"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { marketApi, MarketDataItem } from "@/lib/market-api"

interface MarketDataContextType {
  tickerData: MarketDataItem[]
  isLoading: boolean
  error: Error | null
  lastUpdated: Date | null
  refreshData: () => Promise<void>
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined)

interface MarketDataProviderProps {
  children: ReactNode
  refreshInterval?: number // milliseconds, default 20 seconds
}

export function MarketDataProvider({ 
  children, 
  refreshInterval = 30000 // 30 saniye
}: MarketDataProviderProps) {
  const [tickerData, setTickerData] = useState<MarketDataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await marketApi.getTickerData()
      setTickerData(response.items)
      setLastUpdated(new Date())
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Market verisi yüklenemedi')
      setError(error)
      console.error('Market verisi yüklenemedi:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // İlk yükleme
    refreshData()
    
    // Otomatik güncelleme interval'ı
    const interval = setInterval(refreshData, refreshInterval)
    
    return () => clearInterval(interval)
  }, [refreshInterval, refreshData])

  return (
    <MarketDataContext.Provider 
      value={{ 
        tickerData, 
        isLoading, 
        error, 
        lastUpdated,
        refreshData 
      }}
    >
      {children}
    </MarketDataContext.Provider>
  )
}

export function useMarketData() {
  const context = useContext(MarketDataContext)
  if (context === undefined) {
    throw new Error('useMarketData must be used within a MarketDataProvider')
  }
  return context
}

