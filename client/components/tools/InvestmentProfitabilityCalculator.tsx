"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Yatırım Karlılık Hesaplama
 * Karlılık = (Gelir - Yatırım) / Yatırım × 100
 */
export default function InvestmentProfitabilityCalculator({ config }: ToolComponentProps) {
  const [investment, setInvestment] = useState(config?.defaultValues?.investment || 100000)
  const [revenue, setRevenue] = useState(config?.defaultValues?.revenue || 150000)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const profit = revenue - investment
    const profitability = (profit / investment) * 100
    const returnRatio = revenue / investment

    setResult({
      investment,
      revenue,
      profit,
      profitability,
      returnRatio,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yatırım Karlılık Hesaplama</CardTitle>
        <CardDescription>Yatırımın karlılık oranını hesaplayın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="investment">Yatırım Tutarı (₺)</Label>
          <FormattedNumberInput
            id="investment"
            value={investment}
            onChange={(val) => setInvestment(val || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="revenue">Gelir (₺)</Label>
          <FormattedNumberInput
            id="revenue"
            value={revenue}
            onChange={(val) => setRevenue(val || 0)}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Hesapla
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span>Net Kâr:</span>
              <span className={`font-bold ${result.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.profit.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Karlılık Oranı:</span>
              <span className={`font-bold text-lg ${result.profitability >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.profitability.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Getiri Oranı:</span>
              <span className="font-bold">{result.returnRatio.toFixed(2)}x</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
