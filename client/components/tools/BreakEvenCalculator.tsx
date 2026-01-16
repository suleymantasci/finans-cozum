"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Break-Even (Başabaş Noktası) Hesaplama
 * Formül: Break-Even Units = Fixed Costs / (Price - Variable Cost per Unit)
 * Break-Even Revenue = Break-Even Units × Price
 */
export default function BreakEvenCalculator({ config }: ToolComponentProps) {
  const [fixedCosts, setFixedCosts] = useState(config?.defaultValues?.fixedCosts || 50000)
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(config?.defaultValues?.variableCostPerUnit || 20)
  const [pricePerUnit, setPricePerUnit] = useState(config?.defaultValues?.pricePerUnit || 50)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const contributionMargin = pricePerUnit - variableCostPerUnit
    
    if (contributionMargin <= 0) {
      setResult({
        error: 'Birim fiyat, birim değişken maliyetten büyük olmalıdır!',
      })
      return
    }

    const breakEvenUnits = fixedCosts / contributionMargin
    const breakEvenRevenue = breakEvenUnits * pricePerUnit

    setResult({
      breakEvenUnits,
      breakEvenRevenue,
      contributionMargin,
      fixedCosts,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Break-Even (Başabaş Noktası)</CardTitle>
        <CardDescription>Kâr/zarar eşitliğinin sağlandığı üretim miktarını bulun</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fixedCosts">Sabit Maliyetler (₺)</Label>
          <FormattedNumberInput
            id="fixedCosts"
            value={fixedCosts}
            onChange={(val) => setFixedCosts(val || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="variableCostPerUnit">Birim Değişken Maliyet (₺)</Label>
          <FormattedNumberInput
            id="variableCostPerUnit"
            value={variableCostPerUnit}
            onChange={(val) => setVariableCostPerUnit(val || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pricePerUnit">Birim Satış Fiyatı (₺)</Label>
          <FormattedNumberInput
            id="pricePerUnit"
            value={pricePerUnit}
            onChange={(val) => setPricePerUnit(val || 0)}
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
                <div className="flex justify-between">
                  <span>Katkı Marjı (Birim):</span>
                  <span className="font-bold">{result.contributionMargin.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Başabaş Üretim Miktarı:</span>
                  <span className="font-bold text-lg">{Math.ceil(result.breakEvenUnits).toLocaleString('tr-TR')} adet</span>
                </div>
                <div className="flex justify-between">
                  <span>Başabaş Satış Geliri:</span>
                  <span className="font-bold text-lg">{result.breakEvenRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
