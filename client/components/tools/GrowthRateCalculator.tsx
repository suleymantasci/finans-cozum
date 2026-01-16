"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Yatırım Büyüme Oranı (CAGR - Compound Annual Growth Rate)
 * Formül: CAGR = ((Bitiş/Başlangıç)^(1/Yıl)) - 1
 */
export default function GrowthRateCalculator({ config }: ToolComponentProps) {
  const [initialValue, setInitialValue] = useState(config?.defaultValues?.initialValue || 100000)
  const [finalValue, setFinalValue] = useState(config?.defaultValues?.finalValue || 200000)
  const [years, setYears] = useState(config?.defaultValues?.years || 5)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    if (initialValue <= 0 || years <= 0) {
      setResult({ error: 'Başlangıç değeri ve süre pozitif olmalıdır!' })
      return
    }

    const cagr = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100
    const totalGrowth = ((finalValue - initialValue) / initialValue) * 100

    setResult({
      cagr,
      totalGrowth,
      initialValue,
      finalValue,
      years,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yatırım Büyüme Oranı (CAGR)</CardTitle>
        <CardDescription>Yıllık bileşik büyüme oranını hesaplayın</CardDescription>
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
            {result.error ? (
              <div className="text-red-600">{result.error}</div>
            ) : (
              <>
                <div className="flex justify-between border-b pb-2">
                  <span>CAGR (Yıllık Büyüme Oranı):</span>
                  <span className={`font-bold text-lg ${result.cagr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.cagr >= 0 ? '+' : ''}{result.cagr.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Toplam Büyüme:</span>
                  <span className={`font-bold ${result.totalGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.totalGrowth >= 0 ? '+' : ''}{result.totalGrowth.toFixed(2)}%
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
