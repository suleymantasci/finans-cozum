"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToolComponentProps } from './registry'
import { calculateTaxes, convertInterestRate, getTaxRates, type CreditType } from '@/lib/utils/credit-taxes'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Ödeme Planı Çıktısı
 * Kredi için detaylı ödeme planı ve çizelgesi oluşturur
 * KKDF ve BSMV dahil kümülatif bilgiler
 */
export default function PaymentScheduleCalculator({ config }: ToolComponentProps) {
  const searchParams = useSearchParams()
  
  // Query parametrelerinden değerleri oku (hero section'dan gelebilir)
  const queryPrincipal = searchParams.get('principal')
  const queryRate = searchParams.get('rate')
  const queryMonths = searchParams.get('months')
  const queryCreditType = searchParams.get('creditType') as CreditType | null
  const queryRateType = searchParams.get('rateType') as 'monthly' | 'annual' | null

  const [principal, setPrincipal] = useState(() => {
    if (queryPrincipal) return parseFloat(queryPrincipal) || config?.defaultValues?.principal || 100000
    return config?.defaultValues?.principal || 100000
  })
  const [rate, setRate] = useState(() => {
    if (queryRate) return parseFloat(queryRate) || config?.defaultValues?.rate || 1.8
    return config?.defaultValues?.rate || 1.8
  })
  const [months, setMonths] = useState(() => {
    if (queryMonths) return parseInt(queryMonths) || config?.defaultValues?.months || 36
    return config?.defaultValues?.months || 36
  })
  const [rateType, setRateType] = useState<'monthly' | 'annual'>(queryRateType || 'monthly')
  const [creditType, setCreditType] = useState<CreditType>(queryCreditType || 'none')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    // Faiz oranını aylığa çevir
    const annualRate = rateType === 'monthly' ? convertInterestRate(rate, 'monthly', 'annual') : rate
    const monthlyRate = annualRate / 100 / 12
    
    // KKDF ve BSMV oranlarını al
    const taxRates = creditType !== 'none' ? getTaxRates(creditType) : { kkdf: 0, bsmv: 0 }
    const totalTaxRate = taxRates.kkdf + taxRates.bsmv
    
    // Eğer vergi varsa, efektif faiz oranını hesapla
    // Efektif oran = r * (1 + KKDF + BSMV) çünkü vergiler faiz üzerinden hesaplanıyor
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
    
    const schedule: any[] = []
    let remainingBalance = principal
    let totalInterest = 0
    let totalPrincipal = 0
    let totalKkdf = 0
    let totalBsmv = 0
    
    for (let month = 1; month <= months; month++) {
      const interestPayment = remainingBalance * monthlyRate
      
      // Vergiler hesapla
      const taxes = creditType !== 'none' ? calculateTaxes(interestPayment, creditType) : { kkdf: 0, bsmv: 0 }
      const kkdf = taxes.kkdf
      const bsmv = taxes.bsmv
      
      // Toplam taksit = AnaPara + Faiz + KKDF + BSMV
      // Sabit taksit tutarını koruyoruz
      let totalPaymentThisMonth = month === months 
        ? remainingBalance + interestPayment + kkdf + bsmv // Son ay kalan borcu öde
        : fixedPaymentWithTax
      
      // Ana para = Toplam taksit - Faiz - KKDF - BSMV
      let principalPayment = totalPaymentThisMonth - interestPayment - kkdf - bsmv
      
      // Son dönemde kalan bakiye düzeltmesi
      if (month === months) {
        principalPayment = remainingBalance
        totalPaymentThisMonth = principalPayment + interestPayment + kkdf + bsmv
      }
      
      remainingBalance -= principalPayment
      totalInterest += interestPayment
      totalPrincipal += principalPayment
      totalKkdf += kkdf
      totalBsmv += bsmv

      schedule.push({
        month,
        payment: monthlyPayment,
        adjustedPayment: totalPaymentThisMonth,
        principal: principalPayment,
        interest: interestPayment,
        kkdf,
        bsmv,
        balance: Math.max(0, remainingBalance),
        cumulativeInterest: totalInterest,
        cumulativePrincipal: totalPrincipal,
        cumulativeKkdf: totalKkdf,
        cumulativeBsmv: totalBsmv,
      })
    }

    setResult({
      monthlyPayment,
      adjustedMonthlyPayment: creditType !== 'none' ? fixedPaymentWithTax : monthlyPayment,
      schedule,
      totalPayment: creditType !== 'none' ? totalInterest + totalPrincipal + totalKkdf + totalBsmv : monthlyPayment * months,
      totalInterest,
      totalPrincipal,
      totalKkdf,
      totalBsmv,
      totalCost: totalInterest + totalKkdf + totalBsmv,
      principal,
    })
  }

  // Query parametreleri varsa otomatik hesapla
  useEffect(() => {
    if (queryPrincipal || queryRate || queryMonths || queryCreditType) {
      // Kısa bir gecikme ile hesapla (component mount olduktan sonra)
      const timer = setTimeout(() => {
        calculate()
      }, 100)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Sadece mount'ta çalış, calculate fonksiyonu state'e bağlı

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ödeme Planı Çıktısı</CardTitle>
        <CardDescription>Kredi için detaylı ödeme planı ve çizelgesi oluşturun (KKDF ve BSMV dahil)</CardDescription>
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
          Plan Oluştur
        </Button>
        {result && (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between">
                <span>Aylık Taksit:</span>
                <span className="font-bold text-lg">
                  {creditType !== 'none' && result.adjustedMonthlyPayment
                    ? result.adjustedMonthlyPayment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : result.monthlyPayment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  } ₺
                </span>
              </div>
              <div className="flex justify-between">
                <span>Toplam Ödeme:</span>
                <span className="font-bold">{result.totalPayment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
              </div>
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Toplam Faiz:</span>
                  <span className="font-bold text-red-600">{result.totalInterest.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
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
                  <span className="font-bold text-red-600">{result.totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
                </div>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Ay</th>
                    <th className="p-2 text-right">Taksit</th>
                    <th className="p-2 text-right">Ana Para</th>
                    <th className="p-2 text-right">Faiz</th>
                    {creditType !== 'none' && (result.totalKkdf > 0 || result.totalBsmv > 0) && (
                      <>
                        <th className="p-2 text-right">KKDF</th>
                        <th className="p-2 text-right">BSMV</th>
                      </>
                    )}
                    <th className="p-2 text-right">Toplam Ana Para</th>
                    <th className="p-2 text-right">Toplam Faiz</th>
                    <th className="p-2 text-right">Kalan</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((row: any) => (
                    <tr key={row.month} className="border-t">
                      <td className="p-2 font-medium">{row.month}</td>
                      <td className="p-2 text-right font-medium">
                        {creditType !== 'none' && row.adjustedPayment > row.payment
                          ? row.adjustedPayment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : row.payment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        } ₺
                      </td>
                      <td className="p-2 text-right">{row.principal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
                      <td className="p-2 text-right text-red-600">{row.interest.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
                      {creditType !== 'none' && (result.totalKkdf > 0 || result.totalBsmv > 0) && (
                        <>
                          <td className="p-2 text-right text-xs">{row.kkdf > 0 ? row.kkdf.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'} ₺</td>
                          <td className="p-2 text-right text-xs">{row.bsmv > 0 ? row.bsmv.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'} ₺</td>
                        </>
                      )}
                      <td className="p-2 text-right text-blue-600">{row.cumulativePrincipal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
                      <td className="p-2 text-right text-red-600">{row.cumulativeInterest.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
                      <td className="p-2 text-right">{row.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
