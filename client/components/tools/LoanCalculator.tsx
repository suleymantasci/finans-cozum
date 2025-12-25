"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'

export default function LoanCalculator({ config }: ToolComponentProps) {
  const [principal, setPrincipal] = useState(config?.defaultValues?.principal || 100000)
  const [rate, setRate] = useState(config?.defaultValues?.rate || 12)
  const [months, setMonths] = useState(config?.defaultValues?.months || 36)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const monthlyRate = rate / 100 / 12
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    const totalPayment = payment * months
    const totalInterest = totalPayment - principal

    setResult({
      monthlyPayment: payment,
      totalPayment,
      totalInterest,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kredi Hesaplama</CardTitle>
        <CardDescription>İhtiyaç, konut ve taşıt kredisi hesaplayın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="principal">Kredi Tutarı (₺)</Label>
          <Input
            id="principal"
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            min={config?.validation?.principal?.min || 1000}
            max={config?.validation?.principal?.max || 10000000}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate">Yıllık Faiz Oranı (%)</Label>
          <Input
            id="rate"
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            min={config?.validation?.rate?.min || 0.1}
            max={config?.validation?.rate?.max || 100}
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
            min={config?.validation?.months?.min || 1}
            max={config?.validation?.months?.max || 120}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Hesapla
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span>Aylık Taksit:</span>
              <span className="font-bold">{result.monthlyPayment.toFixed(2)} ₺</span>
            </div>
            <div className="flex justify-between">
              <span>Toplam Ödeme:</span>
              <span className="font-bold">{result.totalPayment.toFixed(2)} ₺</span>
            </div>
            <div className="flex justify-between">
              <span>Toplam Faiz:</span>
              <span className="font-bold">{result.totalInterest.toFixed(2)} ₺</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


