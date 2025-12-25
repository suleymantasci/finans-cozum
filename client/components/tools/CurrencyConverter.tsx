"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { toolsApi } from '@/lib/tools-api'

export default function CurrencyConverter({ config, toolId, data, dataSourceType }: ToolComponentProps) {
  const [amount, setAmount] = useState(config?.defaultValues?.amount || 100)
  const [from, setFrom] = useState(config?.defaultValues?.from || 'USD')
  const [to, setTo] = useState(config?.defaultValues?.to || 'TRY')
  const [rates, setRates] = useState<any>(null)
  const [result, setResult] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (dataSourceType === 'EXTERNAL_API' && data) {
      setRates(data)
    } else if (toolId && dataSourceType === 'EXTERNAL_API') {
      loadRates()
    }
  }, [data, toolId, dataSourceType])

  const loadRates = async () => {
    if (!toolId) return
    setLoading(true)
    try {
      const response = await toolsApi.getToolData(toolId)
      setRates(response.data)
    } catch (error) {
      console.error('Kurlar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculate = () => {
    if (!rates) {
      alert('Döviz kurları yüklenemedi. Lütfen daha sonra tekrar deneyin.')
      return
    }

    // Basit hesaplama (gerçek uygulamada rates array'inden doğru kur bulunmalı)
    const fromRate = rates.find((r: any) => r.code === from || r.currency === from)?.rate || 1
    const toRate = rates.find((r: any) => r.code === to || r.currency === to)?.rate || 1

    if (from === 'TRY') {
      setResult((amount / toRate) * fromRate)
    } else if (to === 'TRY') {
      setResult(amount * fromRate)
    } else {
      setResult((amount * fromRate) / toRate)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Döviz Çevirici</CardTitle>
        <CardDescription>Anlık kurlarla döviz çevirisi yapın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <p className="text-sm text-muted-foreground">Kurlar yükleniyor...</p>}
        <div className="space-y-2">
          <Label htmlFor="amount">Miktar</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={0}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from">Kaynak Para Birimi</Label>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger id="from">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TRY">TRY</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">Hedef Para Birimi</Label>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger id="to">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TRY">TRY</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={calculate} className="w-full" disabled={loading || !rates}>
          Çevir
        </Button>
        {result !== null && (
          <div className="mt-4 rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">Sonuç</p>
            <p className="text-2xl font-bold">{result.toFixed(2)} {to}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


