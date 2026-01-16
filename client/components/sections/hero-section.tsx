"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calculator, TrendingUp, ArrowRight, CreditCard } from "lucide-react"
import { useMemo } from "react"
import { calculateTaxes, convertInterestRate } from "@/lib/utils/credit-taxes"

export function HeroSection() {
  // Kredi hesaplama parametreleri
  const principal = 100000
  const rate = 2.99 // Aylık faiz oranı
  const months = 36
  const creditType = 'ihtiyac' // İhtiyaç kredisi
  const rateType = 'monthly' // Aylık faiz

  // Aylık taksit hesaplama (KKDF ve BSMV dahil)
  const monthlyPayment = useMemo(() => {
    const annualRate = convertInterestRate(rate, 'monthly', 'annual') // Aylıktan yıllığa çevir
    let monthlyRate = annualRate / 100 / 12
    
    // İhtiyaç kredisi için KKDF %15, BSMV %15
    const rates = { kkdf: 0.15, bsmv: 0.15 }
    const effectiveMonthlyRate = monthlyRate * (1 + rates.kkdf + rates.bsmv)
    
    // PMT formülü: P * (r * (1+r)^n) / ((1+r)^n - 1)
    const payment = principal * (effectiveMonthlyRate * Math.pow(1 + effectiveMonthlyRate, months)) / (Math.pow(1 + effectiveMonthlyRate, months) - 1)
    
    return payment
  }, [principal, rate, months])

  // Detaylı hesaplama sayfasına git (query parametreleri ile)
  const detailUrl = `/araclar/odeme-plani-ciktisi?principal=${principal}&rate=${rate}&months=${months}&creditType=${creditType}&rateType=${rateType}`

  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Sol Taraf - İçerik */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-(--color-surface) px-3 py-1 text-sm w-fit">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--color-primary) opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-(--color-primary)"></span>
            </span>
            <span className="text-(--color-foreground-muted)">Canlı Piyasa Verileri</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
            Finansal Kararlarınız İçin
            <span className="text-(--color-primary)"> Akıllı Araçlar</span>
          </h1>

          <p className="text-lg text-(--color-foreground-muted) md:text-xl">
            Kredi hesaplama, döviz takibi ve daha fazlası. Finansal hedeflerinize ulaşmak için
            ihtiyacınız olan tüm araçlar tek platformda.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/araclar">
                <Calculator className="h-5 w-5" />
                Araçları Keşfet
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 bg-transparent">
              <Link href="/piyasalar">
                <TrendingUp className="h-5 w-5" />
                Piyasalara Göz At
              </Link>
            </Button>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-(--color-primary)">25+</div>
              <div className="text-sm text-(--color-foreground-muted)">Finans Aracı</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-(--color-primary)">100K+</div>
              <div className="text-sm text-(--color-foreground-muted)">Kullanıcı</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-(--color-primary)">7/24</div>
              <div className="text-sm text-(--color-foreground-muted)">Canlı Veri</div>
            </div>
          </div>
        </div>

        {/* Sağ Taraf - Kredi Hesaplama Kartı */}
        <div className="relative lg:order-last">
          <div className="relative overflow-hidden rounded-2xl border bg-(--color-card) p-6 shadow-2xl">
            {/* Kredi Hesaplama Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Kredi Hesaplama</h3>
                <CreditCard className="h-5 w-5 text-(--color-primary)" />
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border bg-(--color-surface) p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-(--color-foreground-muted)">Kredi Tutarı</span>
                    <span className="font-semibold">₺{principal.toLocaleString('tr-TR')}</span>
                  </div>
                </div>

                <div className="rounded-lg border bg-(--color-surface) p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-(--color-foreground-muted)">Vade</span>
                    <span className="font-semibold">{months} Ay</span>
                  </div>
                </div>

                <div className="rounded-lg border bg-(--color-surface) p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-(--color-foreground-muted)">Aylık Faiz Oranı</span>
                    <span className="font-semibold text-(--color-primary)">%{rate.toFixed(2)}</span>
                  </div>
                </div>

                <div className="rounded-lg border bg-(--color-surface) p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-(--color-foreground-muted)">Kredi Türü</span>
                    <span className="font-semibold text-sm">İhtiyaç Kredisi</span>
                  </div>
                </div>

                <div className="rounded-lg bg-gradient-to-r from-(--color-primary) to-(--color-primary)/90 p-4 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Aylık Taksit</span>
                    <span className="text-xl font-bold">₺{monthlyPayment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="mt-1 text-xs opacity-90">
                    KKDF ve BSMV dahil
                  </div>
                </div>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link href={detailUrl}>
                  Detaylı Hesapla
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-(--color-primary) opacity-10 blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-(--color-accent) opacity-10 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
