"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToolComponentProps } from './registry'
import { calculateTaxes, convertInterestRate, getTaxRates, type CreditType } from '@/lib/utils/credit-taxes'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Toplam Faiz Maliyeti Hesaplama
 * KKDF ve BSMV dahil toplam maliyet hesaplama
 */
export default function TotalInterestCostCalculator({ config }: ToolComponentProps) {
  const [principal, setPrincipal] = useState(config?.defaultValues?.principal || 100000)
  const [rate, setRate] = useState(config?.defaultValues?.rate || 1.8)
  const [months, setMonths] = useState(config?.defaultValues?.months || 36)
  const [rateType, setRateType] = useState<'monthly' | 'annual'>('monthly')
  const [creditType, setCreditType] = useState<CreditType>('none')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    // Faiz oranını aylığa çevir
    const annualRate = rateType === 'monthly' ? convertInterestRate(rate, 'monthly', 'annual') : rate
    const monthlyRate = annualRate / 100 / 12
    
    // KKDF ve BSMV oranlarını al
    const taxRates = creditType !== 'none' ? getTaxRates(creditType) : { kkdf: 0, bsmv: 0 }
    const totalTaxRate = taxRates.kkdf + taxRates.bsmv
    
    // Eğer vergi varsa, efektif faiz oranını hesapla
    const effectiveMonthlyRate = monthlyRate * (1 + totalTaxRate)
    
    // PMT formülü ile vergi dahil sabit taksit hesapla
    let fixedPaymentWithTax = 0
    if (creditType !== 'none' && totalTaxRate > 0) {
      fixedPaymentWithTax = principal * (effectiveMonthlyRate * Math.pow(1 + effectiveMonthlyRate, months)) / (Math.pow(1 + effectiveMonthlyRate, months) - 1)
    } else {
      fixedPaymentWithTax = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    }
    
    // Vergisiz PMT (sadece bilgi amaçlı)
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    
    // Amortisman tablosunu hesapla (doğru toplam değerler için)
    let remainingBalance = principal
    let totalInterest = 0
    let totalKkdf = 0
    let totalBsmv = 0
    
    for (let month = 1; month <= months; month++) {
      const interestPayment = remainingBalance * monthlyRate
      const taxes = creditType !== 'none' ? calculateTaxes(interestPayment, creditType) : { kkdf: 0, bsmv: 0 }
      
      let totalPaymentThisMonth = month === months 
        ? remainingBalance + interestPayment + taxes.kkdf + taxes.bsmv
        : fixedPaymentWithTax
      
      let principalPayment = totalPaymentThisMonth - interestPayment - taxes.kkdf - taxes.bsmv
      
      if (month === months) {
        principalPayment = remainingBalance
        totalPaymentThisMonth = principalPayment + interestPayment + taxes.kkdf + taxes.bsmv
      }
      
      remainingBalance -= principalPayment
      totalInterest += interestPayment
      totalKkdf += taxes.kkdf
      totalBsmv += taxes.bsmv
    }

    const totalPayment = totalInterest + principal + totalKkdf + totalBsmv

    setResult({
      principal,
      monthlyPayment,
      adjustedMonthlyPayment: fixedPaymentWithTax,
      totalPayment,
      totalInterest,
      totalKkdf,
      totalBsmv,
      totalCost: totalInterest + totalKkdf + totalBsmv,
      interestPercentage: (totalInterest / principal) * 100,
      totalCostPercentage: ((totalInterest + totalKkdf + totalBsmv) / principal) * 100,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Toplam Faiz Maliyeti Hesaplama</CardTitle>
        <CardDescription>Kredi için toplam faiz maliyetini hesaplayın (KKDF ve BSMV dahil)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="creditType">Kredi Türü</Label>
          <Select value={creditType} onValueChange={(v: CreditType) => setCreditType(v)}>
            <SelectTrigger id="creditType" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sadece Faiz (Vergi Yok)</SelectItem>
              <SelectItem value="ihtiyac">İhtiyaç Kredisi</SelectItem>
              <SelectItem value="konut">Konut Kredisi</SelectItem>
              <SelectItem value="tasit">Taşıt Kredisi</SelectItem>
              <SelectItem value="ticari">Ticari Kredi</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="principal">Kredi Tutarı (₺)</Label>
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
          <Label htmlFor="months">Vade (Ay)</Label>
          <FormattedNumberInput
            id="months"
            value={months}
            onChange={(val) => setMonths(val || 1)}
            allowDecimal={false}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Hesapla
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span>Aylık Taksit (Vergisiz):</span>
              <span className="font-bold">{result.monthlyPayment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
            </div>
            {creditType !== 'none' && (
              <div className="flex justify-between">
                <span>Aylık Taksit (Vergiler Dahil):</span>
                <span className="font-bold text-primary">{result.adjustedMonthlyPayment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Toplam Ödeme:</span>
              <span className="font-bold">{result.totalPayment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
            </div>
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between">
                <span>Toplam Faiz:</span>
                <span className="font-bold">{result.totalInterest.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
              </div>
              {creditType !== 'none' && result.totalKkdf > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Toplam KKDF:</span>
                  <span>{result.totalKkdf.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
                </div>
              )}
              {creditType !== 'none' && result.totalBsmv > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Toplam BSMV:</span>
                  <span>{result.totalBsmv.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 mt-2">
                <span>Toplam Maliyet:</span>
                <span className="font-bold text-lg text-red-600">{result.totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
              <span>Toplam Maliyet Oranı:</span>
              <span className="font-bold text-red-600">{result.totalCostPercentage.toFixed(2)}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
