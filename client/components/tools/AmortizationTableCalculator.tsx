"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ToolComponentProps } from './registry'
import { calculateTaxes, convertInterestRate, getTaxRates, type CreditType } from '@/lib/utils/credit-taxes'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Amortisman Tablosu
 * Her ay için ana para, faiz, KKDF, BSMV ve kalan bakiye hesaplama
 */
export default function AmortizationTableCalculator({ config }: ToolComponentProps) {
  const [principal, setPrincipal] = useState(config?.defaultValues?.principal || 100000)
  const [rate, setRate] = useState(config?.defaultValues?.rate || 1.8)
  const [months, setMonths] = useState(config?.defaultValues?.months || 36)
  const [rateType, setRateType] = useState<'monthly' | 'annual'>('monthly')
  const [creditType, setCreditType] = useState<CreditType>('none')
  const [amortizationSchedule, setAmortizationSchedule] = useState<any[] | null>(null)
  const [summary, setSummary] = useState<any>(null)

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
    let currentBalance = principal
    let totalInterest = 0
    let totalKkdf = 0
    let totalBsmv = 0
    let totalPrincipalPaid = 0

    for (let month = 1; month <= months; month++) {
      const interestPaid = currentBalance * monthlyRate
      
      // Vergiler hesapla
      const taxes = creditType !== 'none' ? calculateTaxes(interestPaid, creditType) : { kkdf: 0, bsmv: 0 }
      const kkdf = taxes.kkdf
      const bsmv = taxes.bsmv
      
      // Toplam taksit = AnaPara + Faiz + KKDF + BSMV
      // Sabit taksit tutarını koruyoruz
      let totalPaymentThisMonth = month === months 
        ? currentBalance + interestPaid + kkdf + bsmv // Son ay kalan borcu öde
        : fixedPaymentWithTax
      
      // Ana para = Toplam taksit - Faiz - KKDF - BSMV
      let principalPaid = totalPaymentThisMonth - interestPaid - kkdf - bsmv
      
      // Son dönemde kalan bakiye düzeltmesi
      if (month === months) {
        principalPaid = currentBalance
        totalPaymentThisMonth = principalPaid + interestPaid + kkdf + bsmv
      }
      
      const endingBalance = currentBalance - principalPaid

      schedule.push({
        month,
        startingBalance: currentBalance,
        monthlyPayment,
        adjustedPayment: totalPaymentThisMonth,
        interestPaid,
        principalPaid,
        kkdf,
        bsmv,
        endingBalance: endingBalance > 0.01 ? endingBalance : 0,
      })

      currentBalance = endingBalance
      totalInterest += interestPaid
      totalKkdf += kkdf
      totalBsmv += bsmv
      totalPrincipalPaid += principalPaid
    }

    setAmortizationSchedule(schedule)
    setSummary({
      monthlyPayment,
      adjustedMonthlyPayment: creditType !== 'none' ? fixedPaymentWithTax : monthlyPayment,
      totalInterest,
      totalKkdf,
      totalBsmv,
      totalPayment: creditType !== 'none' ? totalInterest + totalPrincipalPaid + totalKkdf + totalBsmv : monthlyPayment * months,
      totalCost: totalInterest + totalKkdf + totalBsmv,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amortisman Tablosu</CardTitle>
        <CardDescription>Kredi ödeme planı ve amortisman tablosunu görüntüleyin (KKDF ve BSMV dahil)</CardDescription>
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
          Tablo Oluştur
        </Button>
        {summary && amortizationSchedule && amortizationSchedule.length > 0 && (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between">
                <span>Aylık Taksit:</span>
                <span className="font-bold text-lg">
                  {creditType !== 'none' && summary.adjustedMonthlyPayment
                    ? summary.adjustedMonthlyPayment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : summary.monthlyPayment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  } ₺
                </span>
              </div>
              <div className="flex justify-between">
                <span>Toplam Ödeme:</span>
                <span className="font-bold">{summary.totalPayment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
              </div>
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Toplam Faiz:</span>
                  <span className="font-bold">{summary.totalInterest.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
                </div>
                {creditType !== 'none' && summary.totalKkdf > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Toplam KKDF:</span>
                    <span>{summary.totalKkdf.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
                  </div>
                )}
                {creditType !== 'none' && summary.totalBsmv > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Toplam BSMV:</span>
                    <span>{summary.totalBsmv.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span>Toplam Maliyet:</span>
                  <span className="font-bold text-red-600">{summary.totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
                </div>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ay</TableHead>
                    <TableHead className="text-right">Başlangıç Bakiyesi</TableHead>
                    <TableHead className="text-right">Taksit</TableHead>
                    {creditType !== 'none' && (summary.totalKkdf > 0 || summary.totalBsmv > 0) && (
                      <>
                        <TableHead className="text-right">Vergiler</TableHead>
                      </>
                    )}
                    <TableHead className="text-right">Ana Para</TableHead>
                    <TableHead className="text-right">Faiz</TableHead>
                    <TableHead className="text-right">Bitiş Bakiyesi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {amortizationSchedule.map((entry) => (
                    <TableRow key={entry.month}>
                      <TableCell>{entry.month}</TableCell>
                      <TableCell className="text-right">{entry.startingBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right font-medium">
                        {creditType !== 'none' && entry.adjustedPayment > entry.monthlyPayment
                          ? entry.adjustedPayment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : entry.monthlyPayment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        }
                      </TableCell>
                      {creditType !== 'none' && (summary.totalKkdf > 0 || summary.totalBsmv > 0) && (
                        <TableCell className="text-right text-xs">
                          {entry.kkdf > 0 && `KKDF: ${entry.kkdf.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                          {entry.kkdf > 0 && entry.bsmv > 0 && ' + '}
                          {entry.bsmv > 0 && `BSMV: ${entry.bsmv.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </TableCell>
                      )}
                      <TableCell className="text-right">{entry.principalPaid.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right text-red-600">{entry.interestPaid.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right">{entry.endingBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
