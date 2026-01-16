"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Enflasyon Etkisi Hesaplama
 * Reel Değer = Nominal Değer / (1 + Enflasyon Oranı)^Yıl
 */
export default function InflationCalculator({ config }: ToolComponentProps) {
  const [nominalValue, setNominalValue] = useState(config?.defaultValues?.nominalValue || 100000)
  const [inflationRate, setInflationRate] = useState(config?.defaultValues?.inflationRate || 20)
  const [years, setYears] = useState(config?.defaultValues?.years || 5)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const inflationDecimal = inflationRate / 100
    const realValue = nominalValue / Math.pow(1 + inflationDecimal, years)
    const purchasingPowerLoss = nominalValue - realValue
    const lossPercentage = (purchasingPowerLoss / nominalValue) * 100

    setResult({
      nominalValue,
      realValue,
      purchasingPowerLoss,
      lossPercentage,
      inflationRate,
      years,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enflasyon Etkisi Hesaplama</CardTitle>
        <CardDescription>Paranızın enflasyon sonrası satın alma gücünü hesaplayın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nominalValue">Nominal Değer (₺)</Label>
          <FormattedNumberInput
            id="nominalValue"
            value={nominalValue}
            onChange={(val) => setNominalValue(val || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inflationRate">Yıllık Enflasyon Oranı (%)</Label>
          <FormattedNumberInput
            id="inflationRate"
            value={inflationRate}
            onChange={(val) => setInflationRate(val || 0)}
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
              <span>Nominal Değer:</span>
              <span className="font-bold">{result.nominalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Reel Değer (Satın Alma Gücü):</span>
              <span className="font-bold text-lg text-primary">{result.realValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
            </div>
            <div className="flex justify-between">
              <span>Satın Alma Gücü Kaybı:</span>
              <span className="font-bold text-red-600">{result.purchasingPowerLoss.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
            </div>
            <div className="flex justify-between">
              <span>Kayıp Oranı:</span>
              <span className="font-bold text-red-600">{result.lossPercentage.toFixed(2)}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
