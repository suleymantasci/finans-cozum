"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'

export default function DepositCalculator({ config }: ToolComponentProps) {
  const [amount, setAmount] = useState(config?.defaultValues?.amount || 100000)
  const [rate, setRate] = useState(config?.defaultValues?.rate || 20)
  const [months, setMonths] = useState(config?.defaultValues?.months || 12)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const monthlyRate = rate / 100 / 12
    const totalInterest = amount * monthlyRate * months
    const totalAmount = amount + totalInterest

    setResult({
      totalInterest,
      totalAmount,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mevduat Hesaplama</CardTitle>
        <CardDescription>Mevduat hesabınızın getirisini hesaplayın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Mevduat Tutarı (₺)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1000}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate">Yıllık Faiz Oranı (%)</Label>
          <Input
            id="rate"
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            min={0}
            max={100}
            step="0.1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="months">Vade (Ay)</Label>
          <Input
            id="months"
            type="number"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            min={1}
            max={120}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Hesapla
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span>Toplam Faiz:</span>
              <span className="font-bold">{result.totalInterest.toFixed(2)} ₺</span>
            </div>
            <div className="flex justify-between">
              <span>Vade Sonu Tutar:</span>
              <span className="font-bold">{result.totalAmount.toFixed(2)} ₺</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

