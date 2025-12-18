import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bell } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-(--color-primary) p-8 md:p-12 lg:p-16">
          {/* Decorative background */}
          <div className="absolute -right-8 -top-8 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -bottom-8 -left-8 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>

          <div className="relative z-10 mx-auto max-w-3xl text-center text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
              <Bell className="h-4 w-4" />
              Ücretsiz Hesap Oluştur
            </div>

            <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">Finansal Hedeflerinize Bugün Başlayın</h2>

            <p className="mb-8 text-lg text-white/90 md:text-xl">
              Ücretsiz hesap oluşturun, kişiselleştirilmiş araçlara erişin ve finansal kararlarınızı daha bilinçli
              verin.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="bg-white text-(--color-primary) hover:bg-white/90">
                <Link href="/kayit" className="gap-2">
                  Hemen Başla
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="/hakkimizda">Daha Fazla Bilgi</Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-white/75">
              Kredi kartı gerekmez • 5 dakikada kurulum • İstediğiniz zaman iptal edin
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
