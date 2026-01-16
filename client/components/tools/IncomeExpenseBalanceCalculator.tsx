"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Gelir – Gider Dengesi
 * Gelir ve giderleri analiz ederek detaylı bütçe dengesi raporu oluşturur
 */
export default function IncomeExpenseBalanceCalculator({ config }: ToolComponentProps) {
  const [income, setIncome] = useState(config?.defaultValues?.income || 50000)
  const [expenses, setExpenses] = useState(config?.defaultValues?.expenses || 40000)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const balance = income - expenses
    const savingsRate = income > 0 ? (balance / income) * 100 : 0
    const expenseRate = income > 0 ? (expenses / income) * 100 : 0
    const monthsToSave = balance > 0 && expenses > 0 ? expenses / balance : 0

    setResult({
      income,
      expenses,
      balance,
      savingsRate,
      expenseRate,
      monthsToSave,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gelir – Gider Dengesi</CardTitle>
        <CardDescription>Gelir ve giderlerinizi analiz ederek bütçe dengesini değerlendirin</CardDescription>
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
          Analiz Et
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between border-b pb-2">
              <span>Net Bakiye:</span>
              <span className={`font-bold text-lg ${result.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Gelir Dağılımı</div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-600 transition-all"
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Gider Dağılımı</div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-600 transition-all"
                    style={{ width: `${Math.min(100, result.expenseRate)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <span>Tasarruf Oranı:</span>
              <span className={`font-bold ${result.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.savingsRate.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Gider Oranı:</span>
              <span className="font-bold">{result.expenseRate.toFixed(2)}%</span>
            </div>
            {result.balance > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-800 mb-1">✅ Pozitif Bakiye</div>
                <div className="text-xs text-green-700">
                  Aylık {result.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}₺ tasarruf ediyorsunuz.
                  {result.monthsToSave > 0 && ` Giderlerinizi ${result.monthsToSave.toFixed(1)} ay karşılayabilirsiniz.`}
                </div>
              </div>
            )}
            {result.balance < 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-sm font-medium text-red-800 mb-1">⚠️ Negatif Bakiye</div>
                <div className="text-xs text-red-700">
                  Aylık {Math.abs(result.balance).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}₺ açık var. Giderlerinizi azaltmanız veya gelirlerinizi artırmanız gerekiyor.
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
