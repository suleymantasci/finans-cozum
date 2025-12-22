"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'

export default function CreditCardDebtCalculator({ config }: ToolComponentProps) {
  const [debt, setDebt] = useState(config?.defaultValues?.debt || 10000)
  const [rate, setRate] = useState(config?.defaultValues?.rate || 2.5)
  const [monthlyPayment, setMonthlyPayment] = useState(config?.defaultValues?.monthlyPayment || 500)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    let remainingDebt = debt
    let months = 0
    let totalInterest = 0

    while (remainingDebt > 0 && months < 120) {
      const interest = remainingDebt * (rate / 100)
      totalInterest += interest
      remainingDebt = remainingDebt + interest - monthlyPayment
      months++

      if (remainingDebt < 0) remainingDebt = 0
    }

    setResult({
      months,
      totalInterest,
      totalPayment: debt + totalInterest,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kredi Kartı Borç Hesaplama</CardTitle>
        <CardDescription>Kredi kartı borcunuzun taksit planını oluşturun</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="debt">Borç Tutarı (₺)</Label>
          <Input
            id="debt"
            type="number"
            value={debt}
            onChange={(e) => setDebt(Number(e.target.value))}
            min={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate">Aylık Faiz Oranı (%)</Label>
          <Input
            id="rate"
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            min={0}
            max={10}
            step="0.1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthlyPayment">Aylık Ödeme (₺)</Label>
          <Input
            id="monthlyPayment"
            type="number"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(Number(e.target.value))}
            min={100}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Hesapla
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span>Ödeme Süresi:</span>
              <span className="font-bold">{result.months} ay</span>
            </div>
            <div className="flex justify-between">
              <span>Toplam Faiz:</span>
              <span className="font-bold">{result.totalInterest.toFixed(2)} ₺</span>
            </div>
            <div className="flex justify-between">
              <span>Toplam Ödeme:</span>
              <span className="font-bold">{result.totalPayment.toFixed(2)} ₺</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

