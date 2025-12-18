"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calculator } from "lucide-react"

export function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState("250000")
  const [interestRate, setInterestRate] = useState("2.99")
  const [loanTerm, setLoanTerm] = useState("36")
  const [loanType, setLoanType] = useState("ihtiyac")
  const [result, setResult] = useState<{
    monthlyPayment: number
    totalPayment: number
    totalInterest: number
  } | null>(null)

  const calculateLoan = () => {
    const principal = Number.parseFloat(loanAmount)
    const monthlyRate = Number.parseFloat(interestRate) / 100 / 12
    const numberOfPayments = Number.parseInt(loanTerm)

    // Aylık taksit hesaplama formülü
    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    const totalPayment = monthlyPayment * numberOfPayments
    const totalInterest = totalPayment - principal

    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle>Kredi Bilgileri</CardTitle>
          <CardDescription>Kredi detaylarını girin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loanType">Kredi Türü</Label>
            <Select value={loanType} onValueChange={setLoanType}>
              <SelectTrigger id="loanType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ihtiyac">İhtiyaç Kredisi</SelectItem>
                <SelectItem value="konut">Konut Kredisi</SelectItem>
                <SelectItem value="tasit">Taşıt Kredisi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanAmount">Kredi Tutarı (₺)</Label>
            <Input
              id="loanAmount"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="250000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">Aylık Faiz Oranı (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="2.99"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanTerm">Vade (Ay)</Label>
            <Select value={loanTerm} onValueChange={setLoanTerm}>
              <SelectTrigger id="loanTerm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 Ay</SelectItem>
                <SelectItem value="24">24 Ay</SelectItem>
                <SelectItem value="36">36 Ay</SelectItem>
                <SelectItem value="48">48 Ay</SelectItem>
                <SelectItem value="60">60 Ay</SelectItem>
                <SelectItem value="72">72 Ay</SelectItem>
                <SelectItem value="84">84 Ay</SelectItem>
                <SelectItem value="96">96 Ay</SelectItem>
                <SelectItem value="120">120 Ay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={calculateLoan} className="w-full" size="lg">
            <Calculator className="mr-2 h-4 w-4" />
            Hesapla
          </Button>
        </CardContent>
      </Card>

      {/* Result Card */}
      <Card className="bg-(--color-surface)">
        <CardHeader>
          <CardTitle>Hesaplama Sonucu</CardTitle>
          <CardDescription>Kredi taksit detayları</CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              <div className="rounded-lg border-2 border-(--color-primary) bg-(--color-primary)/5 p-6">
                <div className="text-sm text-(--color-foreground-muted)">Aylık Taksit</div>
                <div className="text-3xl font-bold text-(--color-primary)">{formatCurrency(result.monthlyPayment)}</div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-(--color-foreground-muted)">Kredi Tutarı</span>
                  <span className="font-semibold">{formatCurrency(Number.parseFloat(loanAmount))}</span>
                </div>

                <div className="flex justify-between border-b pb-3">
                  <span className="text-(--color-foreground-muted)">Toplam Faiz</span>
                  <span className="font-semibold text-(--color-danger)">{formatCurrency(result.totalInterest)}</span>
                </div>

                <div className="flex justify-between border-b pb-3">
                  <span className="text-(--color-foreground-muted)">Toplam Ödeme</span>
                  <span className="font-semibold">{formatCurrency(result.totalPayment)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-(--color-foreground-muted)">Vade</span>
                  <span className="font-semibold">{loanTerm} Ay</span>
                </div>
              </div>

              <div className="rounded-lg bg-(--color-warning)/10 p-4 text-sm">
                <p className="text-(--color-foreground-muted)">
                  Bu hesaplama tahmini bir değerdir. Gerçek kredi koşulları bankalara göre değişiklik gösterebilir.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-(--color-foreground-muted)">
              Hesaplama yapmak için bilgileri doldurun ve "Hesapla" butonuna tıklayın
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
