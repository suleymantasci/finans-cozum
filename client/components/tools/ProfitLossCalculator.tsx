"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Kâr / Zarar Hesaplama
 * Basit: Gelir - Gider = Kâr/Zarar
 */
export default function ProfitLossCalculator({ config }: ToolComponentProps) {
  const [revenue, setRevenue] = useState(config?.defaultValues?.revenue || 100000)
  const [costs, setCosts] = useState(config?.defaultValues?.costs || 75000)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const profitLoss = revenue - costs
    const margin = revenue > 0 ? (profitLoss / revenue) * 100 : 0

    setResult({
      revenue,
      costs,
      profitLoss,
      margin,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kâr / Zarar Hesaplama</CardTitle>
        <CardDescription>Gelir ve giderleri karşılaştırarak net kâr/zararı hesaplayın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="revenue">Toplam Gelir (₺)</Label>
          <FormattedNumberInput
            id="revenue"
            value={revenue}
            onChange={(val) => setRevenue(val || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="costs">Toplam Gider (₺)</Label>
          <FormattedNumberInput
            id="costs"
            value={costs}
            onChange={(val) => setCosts(val || 0)}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Hesapla
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between border-b pb-2">
              <span>{result.profitLoss >= 0 ? 'Net Kâr' : 'Net Zarar'}:</span>
              <span className={`font-bold text-lg ${result.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.profitLoss.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
              </span>
            </div>
            <div className="flex justify-between">
              <span>Kar Marjı:</span>
              <span className={`font-bold ${result.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.margin.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
