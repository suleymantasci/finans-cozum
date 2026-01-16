"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Faiz Oranı Dönüştürme
 * Yıllık, Aylık, Günlük faiz oranlarını birbirine çevirme
 * Aylık = Yıllık / 12
 * Günlük = Yıllık / 365
 */
export default function InterestRateConverter({ config }: ToolComponentProps) {
  const [rate, setRate] = useState(config?.defaultValues?.rate || 1.8)
  const [rateType, setRateType] = useState<'annual' | 'monthly' | 'daily'>('annual')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    let annual: number
    let monthly: number
    let daily: number

    if (rateType === 'annual') {
      annual = rate
      monthly = rate / 12
      daily = rate / 365
    } else if (rateType === 'monthly') {
      monthly = rate
      annual = rate * 12
      daily = (rate * 365) / 12
    } else {
      daily = rate
      annual = rate * 365
      monthly = (rate * 365) / 12
    }

    setResult({
      annual,
      monthly,
      daily,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faiz Oranı Dönüştürme</CardTitle>
        <CardDescription>Yıllık, aylık ve günlük faiz oranlarını dönüştürün</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Girdi Tipi</Label>
          <select
            value={rateType}
            onChange={(e) => setRateType(e.target.value as 'annual' | 'monthly' | 'daily')}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="annual">Yıllık (%)</option>
            <option value="monthly">Aylık (%)</option>
            <option value="daily">Günlük (%)</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate">Faiz Oranı (%)</Label>
          <FormattedNumberInput
            id="rate"
            value={rate}
            onChange={(val) => setRate(val || 0)}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Dönüştür
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between border-b pb-2">
              <span>Yıllık Oran:</span>
              <span className="font-bold text-lg">{result.annual.toFixed(4)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Aylık Oran:</span>
              <span className="font-bold">{result.monthly.toFixed(4)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Günlük Oran:</span>
              <span className="font-bold">{result.daily.toFixed(4)}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
