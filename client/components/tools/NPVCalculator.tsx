"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Net Bugünkü Değer (NPV) Hesaplama
 * Formül: NPV = Σ(CFt / (1 + r)^t) - Initial Investment
 * CFt = t dönemindeki nakit akışı
 * r = İskonto oranı (faiz oranı)
 * t = Dönem
 */
export default function NPVCalculator({ config }: ToolComponentProps) {
  const [initialInvestment, setInitialInvestment] = useState(config?.defaultValues?.initialInvestment || 100000)
  const [discountRate, setDiscountRate] = useState(config?.defaultValues?.discountRate || 10)
  const [cashFlows, setCashFlows] = useState<string[]>(['30000', '35000', '40000', '45000', '50000'])
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const rateDecimal = discountRate / 100
    let npv = -initialInvestment // İlk yatırım negatif
    
    // Her nakit akışını bugünkü değere indir
    cashFlows.forEach((flow, index) => {
      const flowValue = parseFloat(flow) || 0
      const period = index + 1
      const presentValue = flowValue / Math.pow(1 + rateDecimal, period)
      npv += presentValue
    })

    const totalCashInflow = cashFlows.reduce((sum, flow) => sum + (parseFloat(flow) || 0), 0)
    const netProfit = totalCashInflow - initialInvestment

    setResult({
      npv,
      initialInvestment,
      totalCashInflow,
      netProfit,
      discountRate,
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
        <CardTitle>Net Bugünkü Değer (NPV)</CardTitle>
        <CardDescription>Yatırım projelerinin bugünkü değerini hesaplayın</CardDescription>
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
          <Label htmlFor="discountRate">İskonto Oranı (%)</Label>
          <FormattedNumberInput
            id="discountRate"
            value={discountRate}
            onChange={(val) => setDiscountRate(val || 0)}
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
            <div className="flex justify-between">
              <span>Toplam Nakit Girişi:</span>
              <span className="font-bold">{result.totalCashInflow.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
            </div>
            <div className="flex justify-between">
              <span>Net Kâr:</span>
              <span className={`font-bold ${result.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.netProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>NPV (Net Bugünkü Değer):</span>
              <span className={`font-bold text-lg ${result.npv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.npv >= 0 ? '+' : ''}{result.npv.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
              </span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {result.npv >= 0 ? '✅ Yatırım karlı (NPV pozitif)' : '❌ Yatırım karlı değil (NPV negatif)'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
