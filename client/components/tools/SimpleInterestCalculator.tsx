"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToolComponentProps } from './registry'
import { convertInterestRate } from '@/lib/utils/credit-taxes'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Basit Faiz Hesaplama
 * Formül: I = P × r × t
 * I = Faiz
 * P = Ana Para (Principal)
 * r = Yıllık Faiz Oranı (decimal)
 * t = Süre (yıl olarak)
 */
export default function SimpleInterestCalculator({ config }: ToolComponentProps) {
  const [principal, setPrincipal] = useState(config?.defaultValues?.principal || 100000)
  const [rate, setRate] = useState(config?.defaultValues?.rate || 10)
  const [rateType, setRateType] = useState<'monthly' | 'annual'>('annual')
  const [time, setTime] = useState(config?.defaultValues?.time || 1)
  const [timeUnit, setTimeUnit] = useState<'years' | 'months' | 'days'>('years')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    // Faiz oranını yıllığa çevir
    const annualRate = rateType === 'monthly' ? convertInterestRate(rate, 'monthly', 'annual') : rate
    
    // Zamanı yıl cinsine çevir
    let timeInYears = time
    if (timeUnit === 'months') {
      timeInYears = time / 12
    } else if (timeUnit === 'days') {
      timeInYears = time / 365
    }

    // Basit faiz formülü: I = P × r × t
    const rateDecimal = annualRate / 100
    const interest = principal * rateDecimal * timeInYears
    const total = principal + interest

    setResult({
      principal,
      interest,
      total,
      timeInYears: timeInYears.toFixed(4),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basit Faiz Hesaplama</CardTitle>
        <CardDescription>Ana para üzerinden sabit faiz hesaplaması yapın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="principal">Ana Para (₺)</Label>
          <FormattedNumberInput
            id="principal"
            value={principal}
            onChange={(val) => setPrincipal(val || 0)}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="rate">Faiz Oranı ({rateType === 'monthly' ? 'Aylık' : 'Yıllık'} %)</Label>
            <FormattedNumberInput
              id="rate"
              value={rate}
              onChange={(val) => setRate(val || 0)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="rateType">Faiz Oranı Tipi</Label>
            <Select value={rateType} onValueChange={(v: 'monthly' | 'annual') => setRateType(v)}>
              <SelectTrigger id="rateType" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Aylık (%)</SelectItem>
                <SelectItem value="annual">Yıllık (%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Süre</Label>
          <div className="flex gap-2">
            <FormattedNumberInput
              id="time"
              value={time}
              onChange={(val) => setTime(val || 0)}
              className="flex-1"
            />
            <select
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value as 'years' | 'months' | 'days')}
              className="rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="years">Yıl</option>
              <option value="months">Ay</option>
              <option value="days">Gün</option>
            </select>
          </div>
        </div>
        <Button onClick={calculate} className="w-full">
          Hesapla
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span>Ana Para:</span>
              <span className="font-bold">{result.principal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
            </div>
            <div className="flex justify-between">
              <span>Faiz:</span>
              <span className="font-bold text-primary">{result.interest.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Toplam:</span>
              <span className="font-bold text-lg">{result.total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
