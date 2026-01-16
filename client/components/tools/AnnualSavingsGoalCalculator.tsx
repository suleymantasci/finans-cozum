"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Yıllık Tasarruf Hedefi Hesaplama
 * Hedef / Yıl = Aylık tasarruf miktarı
 */
export default function AnnualSavingsGoalCalculator({ config }: ToolComponentProps) {
  const [goal, setGoal] = useState(config?.defaultValues?.goal || 120000)
  const [years, setYears] = useState(config?.defaultValues?.years || 1)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const monthlySavings = goal / (years * 12)
    const annualSavings = goal / years

    setResult({
      goal,
      years,
      monthlySavings,
      annualSavings,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yıllık Tasarruf Hedefi Hesaplama</CardTitle>
        <CardDescription>Hedef tutara ulaşmak için gereken aylık tasarruf miktarını bulun</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="goal">Hedef Tutar (₺)</Label>
          <FormattedNumberInput
            id="goal"
            value={goal}
            onChange={(val) => setGoal(val || 0)}
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
            <div className="flex justify-between border-b pb-2">
              <span>Aylık Tasarruf:</span>
              <span className="font-bold text-lg text-primary">{result.monthlySavings.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
            </div>
            <div className="flex justify-between">
              <span>Yıllık Tasarruf:</span>
              <span className="font-bold">{result.annualSavings.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
