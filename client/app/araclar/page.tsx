import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, Calendar, DollarSign, PiggyBank, CreditCard, Percent, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Finans Hesaplama Araçları | Finanscözüm",
  description:
    "Kredi hesaplama, vade hesaplama, döviz çevirici ve daha fazlası. Finansal hesaplamalarınızı kolaylaştıran araçlar.",
  keywords: "kredi hesaplama, vade hesaplama, döviz çevirici, mevduat hesaplama, faiz hesaplama",
}

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
    title: "Kredi Kartı Borç Hesaplama",
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

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Finans Hesaplama Araçları</h1>
        <p className="mx-auto max-w-2xl text-lg text-(--color-foreground-muted)">
          Finansal kararlarınızı daha bilinçli vermek için ihtiyacınız olan tüm hesaplama araçları
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.title} href={tool.href}>
            <Card className="group h-full transition-all hover:shadow-lg hover:border-(--color-primary)/50">
              <CardHeader>
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${tool.bgColor}`}>
                  <tool.icon className={`h-6 w-6 ${tool.color}`} />
                </div>
                <CardTitle className="flex items-center justify-between text-xl">
                  {tool.title}
                  <ArrowRight className="h-5 w-5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                </CardTitle>
                <CardDescription className="text-base">{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
