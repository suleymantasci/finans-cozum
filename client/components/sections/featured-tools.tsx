import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Calendar, PiggyBank, CreditCard, DollarSign, ArrowRight, Percent } from "lucide-react"

const tools = [
  {
    title: "Kredi Hesaplama",
    description: "İhtiyaç, konut ve taşıt kredisi hesaplayın, aylık taksitlerinizi öğrenin",
    icon: Calculator,
    href: "/araclar/kredi-hesaplama",
    color: "text-(--color-primary)",
    bgColor: "bg-(--color-primary)/10",
  },
  {
    title: "Vade Hesaplama",
    description: "Yatırımlarınızın vade sonunda kazancını hesaplayın",
    icon: Calendar,
    href: "/araclar/vade-hesaplama",
    color: "text-(--color-accent)",
    bgColor: "bg-(--color-accent)/10",
  },
  {
    title: "Döviz Çevirici",
    description: "Anlık kurlarla döviz ve kripto para çevirisi yapın",
    icon: DollarSign,
    href: "/araclar/doviz-cevirici",
    color: "text-(--color-success)",
    bgColor: "bg-(--color-success)/10",
  },
  {
    title: "Mevduat Hesaplama",
    description: "Mevduat hesabınızın getirisini ve faiz kazancını hesaplayın",
    icon: PiggyBank,
    href: "/araclar/mevduat-hesaplama",
    color: "text-(--color-warning)",
    bgColor: "bg-(--color-warning)/10",
  },
  {
    title: "Kredi Kartı Borç",
    description: "Kredi kartı borcunuzun taksit planını oluşturun",
    icon: CreditCard,
    href: "/araclar/kredi-karti-borc",
    color: "text-(--color-danger)",
    bgColor: "bg-(--color-danger)/10",
  },
  {
    title: "Faiz Hesaplama",
    description: "Basit ve bileşik faiz hesaplamaları yapın",
    icon: Percent,
    href: "/araclar/faiz-hesaplama",
    color: "text-(--color-primary)",
    bgColor: "bg-(--color-primary)/10",
  },
]

export function FeaturedTools() {
  return (
    <section className="border-t bg-(--color-background) py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Popüler Finans Araçları</h2>
          <p className="mx-auto max-w-2xl text-lg text-(--color-foreground-muted)">
            Finansal hesaplamalarınızı kolaylaştıran, kullanımı basit ve güvenilir araçlarımızla tanışın
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Card key={tool.title} className="group transition-all hover:shadow-lg hover:border-(--color-primary)/50">
              <CardHeader>
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${tool.bgColor}`}>
                  <tool.icon className={`h-6 w-6 ${tool.color}`} />
                </div>
                <CardTitle className="text-xl">{tool.title}</CardTitle>
                <CardDescription className="text-base">{tool.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="ghost" className="group-hover:text-(--color-primary)">
                  <Link href={tool.href} className="flex items-center gap-2">
                    Hesapla
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/araclar">
              Tüm Araçları Görüntüle
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
