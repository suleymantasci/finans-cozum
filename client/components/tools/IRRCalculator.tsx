"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * İç Verim Oranı (IRR) Hesaplama
 * NPV = 0 yapan iskonto oranını bulur
 * Newton-Raphson iteratif yöntemi kullanılır
 */
export default function IRRCalculator({ config }: ToolComponentProps) {
  const [initialInvestment, setInitialInvestment] = useState(config?.defaultValues?.initialInvestment || 100000)
  const [cashFlows, setCashFlows] = useState<string[]>(['30000', '35000', '40000', '45000', '50000'])
  const [result, setResult] = useState<any>(null)

  // NPV hesapla (belirli bir rate ile)
  const calculateNPV = (rate: number, investment: number, flows: number[]): number => {
    let npv = -investment
    flows.forEach((flow, index) => {
      const period = index + 1
      npv += flow / Math.pow(1 + rate, period)
    })
    return npv
  }

  // IRR hesapla (Newton-Raphson yöntemi)
  const calculateIRR = (investment: number, flows: number[]): number | null => {
    // İlk tahmin: %10
    let rate = 0.1
    const maxIterations = 100
    const tolerance = 0.0001

    for (let i = 0; i < maxIterations; i++) {
      const npv = calculateNPV(rate, investment, flows)
      
      // NPV'nin türevini hesapla
      let derivative = 0
      flows.forEach((flow, index) => {
        const period = index + 1
        derivative -= (flow * period) / Math.pow(1 + rate, period + 1)
      })

      if (Math.abs(derivative) < 1e-10) {
        return null // Türev çok küçük, çözüm bulunamadı
      }

      const newRate = rate - npv / derivative
      
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate
      }

      rate = newRate

      // Negatif veya çok büyük değerleri kontrol et
      if (rate < -0.99 || rate > 10) {
        return null
      }
    }

    return null // İterasyon limitine ulaşıldı
  }

  const calculate = () => {
    const flows = cashFlows.map(f => parseFloat(f) || 0)
    const irr = calculateIRR(initialInvestment, flows)
    
    if (irr === null) {
      setResult({
        error: 'IRR hesaplanamadı. Nakit akışlarını kontrol edin.',
        initialInvestment,
        totalCashInflow: flows.reduce((a, b) => a + b, 0),
      })
      return
    }

    const irrPercent = irr * 100
    const npv = calculateNPV(irr, initialInvestment, flows)

    setResult({
      irr: irrPercent,
      npv: npv,
      initialInvestment,
      totalCashInflow: flows.reduce((a, b) => a + b, 0),
    })
  }

  const updateCashFlow = (index: number, value: string) => {
    const newFlows = [...cashFlows]
    newFlows[index] = value
    setCashFlows(newFlows)
  }

  const addCashFlow = () => {
    setCashFlows([...cashFlows, '0'])
  }

  const removeCashFlow = (index: number) => {
    if (cashFlows.length > 1) {
      const newFlows = cashFlows.filter((_, i) => i !== index)
      setCashFlows(newFlows)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>İç Verim Oranı (IRR)</CardTitle>
        <CardDescription>NPV'nin sıfır olduğu faiz oranını hesaplayın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="initialInvestment">İlk Yatırım (₺)</Label>
          <FormattedNumberInput
            id="initialInvestment"
            value={initialInvestment}
            onChange={(val) => setInitialInvestment(val || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label>Yıllık Nakit Akışları (₺)</Label>
          {cashFlows.map((flow, index) => (
            <div key={index} className="flex gap-2">
              <FormattedNumberInput
                value={parseFloat(flow) || 0}
                onChange={(val) => updateCashFlow(index, val?.toString() || '0')}
                placeholder={`Yıl ${index + 1}`}
              />
              {cashFlows.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeCashFlow(index)}
                >
                  Sil
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addCashFlow} className="w-full">
            + Yıl Ekle
          </Button>
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
                  <span>IRR (İç Verim Oranı):</span>
                  <span className="font-bold text-lg text-primary">{result.irr.toFixed(2)}%</span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {result.irr >= 0 ? '✅ Yatırım karlı' : '❌ Yatırım karlı değil'}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Bu oran NPV=0 yapan faiz oranıdır.
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
