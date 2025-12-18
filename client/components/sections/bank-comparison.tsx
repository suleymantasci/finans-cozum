import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, ArrowRight } from "lucide-react"
import Link from "next/link"

const banks = [
  {
    name: "Ziraat Bankası",
    loanRate: "2.99%",
    depositRate: "45.00%",
    badge: "En Düşük Faiz",
  },
  {
    name: "İş Bankası",
    loanRate: "3.15%",
    depositRate: "44.50%",
    badge: "Popüler",
  },
  {
    name: "Garanti BBVA",
    loanRate: "3.25%",
    depositRate: "44.75%",
    badge: "Dijital Avantaj",
  },
  {
    name: "Akbank",
    loanRate: "3.10%",
    depositRate: "45.25%",
    badge: "Yüksek Getiri",
  },
]

export function BankComparison() {
  return (
    <section className="border-t bg-(--color-surface) py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Banka Karşılaştırması</h2>
          <p className="mx-auto max-w-2xl text-lg text-(--color-foreground-muted)">
            En uygun kredi ve mevduat oranlarını karşılaştırın
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {banks.map((bank) => (
            <Card key={bank.name} className="relative overflow-hidden">
              <div className="absolute right-0 top-0">
                <div className="rounded-bl-lg bg-(--color-primary) px-3 py-1 text-xs font-semibold text-white">
                  {bank.badge}
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-muted)">
                  <Building className="h-6 w-6 text-(--color-foreground-muted)" />
                </div>
                <CardTitle className="text-lg">{bank.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-(--color-foreground-muted)">Kredi Faizi</span>
                    <span className="font-semibold text-(--color-primary)">{bank.loanRate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-(--color-foreground-muted)">Mevduat Faizi</span>
                    <span className="font-semibold">{bank.depositRate}</span>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                  <Link href={`/bankalar/${bank.name.toLowerCase().replace(" ", "-")}`}>Detayları Gör</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/bankalar">
              Tüm Bankaları Karşılaştır
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
