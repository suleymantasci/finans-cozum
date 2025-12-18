import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Euro, Bitcoin } from "lucide-react"

const marketData = [
  {
    title: "USD/TRY",
    value: "34.25",
    change: "+0.45%",
    isUp: true,
    icon: DollarSign,
  },
  {
    title: "EUR/TRY",
    value: "37.82",
    change: "+0.32%",
    isUp: true,
    icon: Euro,
  },
  {
    title: "Bitcoin",
    value: "$95,450",
    change: "-1.25%",
    isUp: false,
    icon: Bitcoin,
  },
  {
    title: "Altın (gr)",
    value: "₺2,845",
    change: "+0.85%",
    isUp: true,
    icon: TrendingUp,
  },
]

export function MarketOverview() {
  return (
    <section className="bg-(--color-surface) py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Canlı Piyasa Özeti</h2>
          <p className="mx-auto max-w-2xl text-lg text-(--color-foreground-muted)">
            Döviz, kripto para ve emtia fiyatlarını anlık takip edin
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {marketData.map((item) => (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                <item.icon className="h-4 w-4 text-(--color-foreground-muted)" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  {item.isUp ? (
                    <TrendingUp className="h-3 w-3 text-(--color-success)" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-(--color-danger)" />
                  )}
                  <span className={item.isUp ? "text-(--color-success)" : "text-(--color-danger)"}>{item.change}</span>
                  <span className="text-(--color-foreground-muted)">son 24 saat</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
