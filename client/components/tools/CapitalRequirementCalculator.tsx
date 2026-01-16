"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * İşletme Sermaye İhtiyacı Hesaplama
 * Sermaye İhtiyacı = Dönen Varlıklar - Kısa Vadeli Borçlar
 * Veya proje bazlı: Toplam Yatırım - Mevcut Kaynaklar
 */
export default function CapitalRequirementCalculator({ config }: ToolComponentProps) {
  const [totalInvestment, setTotalInvestment] = useState(config?.defaultValues?.totalInvestment || 500000)
  const [availableCapital, setAvailableCapital] = useState(config?.defaultValues?.availableCapital || 300000)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const capitalRequirement = totalInvestment - availableCapital
    const fundingPercentage = totalInvestment > 0 ? (availableCapital / totalInvestment) * 100 : 0

    setResult({
      totalInvestment,
      availableCapital,
      capitalRequirement,
      fundingPercentage,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>İşletme Sermaye İhtiyacı</CardTitle>
        <CardDescription>İşletmenin ihtiyaç duyduğu ek sermayeyi hesaplayın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="totalInvestment">Toplam Yatırım İhtiyacı (₺)</Label>
          <FormattedNumberInput
            id="totalInvestment"
            value={totalInvestment}
            onChange={(val) => setTotalInvestment(val || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="availableCapital">Mevcut Sermaye (₺)</Label>
          <FormattedNumberInput
            id="availableCapital"
            value={availableCapital}
            onChange={(val) => setAvailableCapital(val || 0)}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Hesapla
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between border-b pb-2">
              <span>Sermaye İhtiyacı:</span>
              <span className={`font-bold text-lg ${result.capitalRequirement <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {result.capitalRequirement.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
              </span>
            </div>
            <div className="flex justify-between">
              <span>Finansman Oranı:</span>
              <span className="font-bold">{result.fundingPercentage.toFixed(2)}%</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {result.capitalRequirement <= 0 
                ? '✅ Yeterli sermaye mevcut'
                : `⚠️ Ek ${result.capitalRequirement.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}₺ sermaye gerekiyor`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
