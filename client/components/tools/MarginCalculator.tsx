"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Marj ve Kar Oranı Hesaplama
 * Brüt Kar Marjı = ((Satış - Maliyet) / Satış) × 100
 * Kar Oranı = (Kâr / Maliyet) × 100
 */
export default function MarginCalculator({ config }: ToolComponentProps) {
  const [revenue, setRevenue] = useState(config?.defaultValues?.revenue || 100000)
  const [cost, setCost] = useState(config?.defaultValues?.cost || 60000)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const profit = revenue - cost
    const grossMargin = (profit / revenue) * 100
    const profitMargin = (profit / cost) * 100

    setResult({
      revenue,
      cost,
      profit,
      grossMargin,
      profitMargin,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marj ve Kar Oranı Hesaplama</CardTitle>
        <CardDescription>Brüt kar marjı ve kar oranını hesaplayın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="revenue">Satış Geliri (₺)</Label>
          <FormattedNumberInput
            id="revenue"
            value={revenue}
            onChange={(val) => setRevenue(val || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost">Toplam Maliyet (₺)</Label>
          <FormattedNumberInput
            id="cost"
            value={cost}
            onChange={(val) => setCost(val || 0)}
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
              <span>Brüt Kar Marjı:</span>
              <span className={`font-bold text-lg ${result.grossMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.grossMargin.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Kar Oranı:</span>
              <span className={`font-bold text-lg ${result.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.profitMargin.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
