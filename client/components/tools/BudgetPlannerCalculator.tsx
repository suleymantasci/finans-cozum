"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Basit Bütçe Planlayıcı
 * Gelir ve giderleri toplayıp net bütçeyi hesaplar
 */
export default function BudgetPlannerCalculator({ config }: ToolComponentProps) {
  const [income, setIncome] = useState(config?.defaultValues?.income || 50000)
  const [expenses, setExpenses] = useState(config?.defaultValues?.expenses || 40000)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const netBudget = income - expenses
    const savingsRate = income > 0 ? (netBudget / income) * 100 : 0

    setResult({
      income,
      expenses,
      netBudget,
      savingsRate,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basit Bütçe Planlayıcı</CardTitle>
        <CardDescription>Gelir ve giderlerinizi karşılaştırın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="income">Toplam Gelir (₺)</Label>
          <FormattedNumberInput
            id="income"
            value={income}
            onChange={(val) => setIncome(val || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expenses">Toplam Gider (₺)</Label>
          <FormattedNumberInput
            id="expenses"
            value={expenses}
            onChange={(val) => setExpenses(val || 0)}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Hesapla
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between border-b pb-2">
              <span>Net Bütçe:</span>
              <span className={`font-bold text-lg ${result.netBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.netBudget.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tasarruf Oranı:</span>
              <span className={`font-bold ${result.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.savingsRate.toFixed(2)}%
              </span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {result.netBudget >= 0 
                ? `✅ Aylık ${result.netBudget.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}₺ tasarruf edebilirsiniz`
                : `⚠️ Aylık ${Math.abs(result.netBudget).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}₺ açık var`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
