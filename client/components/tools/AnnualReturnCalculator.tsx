"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Yıllık Getiri Hesaplama
 * Formül: ((Bitiş Değeri - Başlangıç Değeri) / Başlangıç Değeri) × 100
 * Veya yıllıklaştırılmış: ((Bitiş/Başlangıç)^(1/Yıl) - 1) × 100
 */
export default function AnnualReturnCalculator({ config }: ToolComponentProps) {
  const [initialValue, setInitialValue] = useState(config?.defaultValues?.initialValue || 100000)
  const [finalValue, setFinalValue] = useState(config?.defaultValues?.finalValue || 120000)
  const [years, setYears] = useState(config?.defaultValues?.years || 1)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    // Toplam getiri oranı
    const totalReturn = ((finalValue - initialValue) / initialValue) * 100
    
    // Yıllıklaştırılmış getiri (CAGR benzeri)
    let annualizedReturn = 0
    if (years > 0 && initialValue > 0) {
      annualizedReturn = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100
    }
    
    const profit = finalValue - initialValue

    setResult({
      initialValue,
      finalValue,
      profit,
      totalReturn,
      annualizedReturn,
      years,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yıllık Getiri Hesaplama</CardTitle>
        <CardDescription>Yatırımınızın toplam ve yıllık getiri oranını hesaplayın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="initialValue">Başlangıç Değeri (₺)</Label>
          <FormattedNumberInput
            id="initialValue"
            value={initialValue}
            onChange={(val) => setInitialValue(val || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="finalValue">Bitiş Değeri (₺)</Label>
          <FormattedNumberInput
            id="finalValue"
            value={finalValue}
            onChange={(val) => setFinalValue(val || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="years">Süre (Yıl)</Label>
          <FormattedNumberInput
            id="years"
            value={years}
            onChange={(val) => setYears(val || 0)}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Hesapla
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span>Toplam Kâr/Zarar:</span>
              <span className={`font-bold ${result.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.profit >= 0 ? '+' : ''}{result.profit.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
              </span>
            </div>
            <div className="flex justify-between">
              <span>Toplam Getiri Oranı:</span>
              <span className={`font-bold ${result.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.totalReturn >= 0 ? '+' : ''}{result.totalReturn.toFixed(2)}%
              </span>
            </div>
            {result.years > 0 && (
              <div className="flex justify-between border-t pt-2">
                <span>Yıllık Getiri Oranı (Ortalama):</span>
                <span className={`font-bold text-lg ${result.annualizedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.annualizedReturn >= 0 ? '+' : ''}{result.annualizedReturn.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
