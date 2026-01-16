"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * ROI (Yatırım Getirisi) Hesaplama
 * Formül: ROI = ((Kazanç - Yatırım) / Yatırım) × 100
 * veya: ROI = (Net Kâr / Yatırım) × 100
 */
export default function ROICalculator({ config }: ToolComponentProps) {
  const [investment, setInvestment] = useState(config?.defaultValues?.investment || 100000)
  const [returnValue, setReturnValue] = useState(config?.defaultValues?.returnValue || 130000)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const profit = returnValue - investment
    const roi = (profit / investment) * 100
    const roiRatio = returnValue / investment

    setResult({
      investment,
      returnValue,
      profit,
      roi,
      roiRatio,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ROI (Yatırım Getirisi)</CardTitle>
        <CardDescription>Yatırımınızın getiri oranını yüzde olarak hesaplayın</CardDescription>
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
          <Label htmlFor="returnValue">Geri Dönen Tutar (₺)</Label>
          <FormattedNumberInput
            id="returnValue"
            value={returnValue}
            onChange={(val) => setReturnValue(val || 0)}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Hesapla
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span>Net Kâr/Zarar:</span>
              <span className={`font-bold ${result.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.profit >= 0 ? '+' : ''}{result.profit.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>ROI:</span>
              <span className={`font-bold text-lg ${result.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.roi >= 0 ? '+' : ''}{result.roi.toFixed(2)}%
              </span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Her 100₺ için {result.roi >= 0 ? '+' : ''}{result.profit.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}₺ {(result.roi >= 0 ? 'kâr' : 'zarar')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
