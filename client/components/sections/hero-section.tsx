import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calculator, TrendingUp, ArrowRight } from "lucide-react"

export function HeroSection() {
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
            Kredi hesaplama, döviz takibi, banka karşılaştırma ve daha fazlası. Finansal hedeflerinize ulaşmak için
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
              <div className="text-2xl font-bold text-(--color-primary)">15+</div>
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

        {/* Sağ Taraf - Görsel */}
        <div className="relative lg:order-last">
          <div className="relative overflow-hidden rounded-2xl border bg-(--color-card) p-6 shadow-2xl">
            {/* Mini Dashboard Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Hızlı Hesaplama</h3>
                <Calculator className="h-5 w-5 text-(--color-primary)" />
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border bg-(--color-surface) p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-(--color-foreground-muted)">Kredi Tutarı</span>
                    <span className="font-semibold">₺250.000</span>
                  </div>
                </div>

                <div className="rounded-lg border bg-(--color-surface) p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-(--color-foreground-muted)">Vade</span>
                    <span className="font-semibold">36 Ay</span>
                  </div>
                </div>

                <div className="rounded-lg border bg-(--color-surface) p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-(--color-foreground-muted)">Faiz Oranı</span>
                    <span className="font-semibold text-(--color-primary)">%2.99</span>
                  </div>
                </div>

                <div className="rounded-lg bg-(--color-primary) p-4 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Aylık Taksit</span>
                    <span className="text-xl font-bold">₺8.456</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg">
                Detaylı Hesapla
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
