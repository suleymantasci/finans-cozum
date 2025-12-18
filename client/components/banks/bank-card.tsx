import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ArrowRight, TrendingUp, TrendingDown } from "lucide-react"

interface Bank {
  id: string
  name: string
  logo: string
  loanRate: string
  depositRate: string
  advantages: string[]
  campaigns: string[]
  rating: number
  badge: string
  color: string
}

export function BankCard({ bank }: { bank: Bank }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className={`h-2 ${bank.color}`} />
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-muted) text-2xl">
              {bank.logo}
            </div>
            <div>
              <CardTitle className="text-xl">{bank.name}</CardTitle>
              <div className="flex items-center gap-1 text-sm text-(--color-foreground-muted)">
                <Star className="h-4 w-4 fill-(--color-warning) text-(--color-warning)" />
                <span className="font-semibold">{bank.rating}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary">{bank.badge}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Rates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border bg-(--color-surface) p-4">
            <div className="mb-1 flex items-center gap-1 text-xs text-(--color-foreground-muted)">
              <TrendingDown className="h-3 w-3" />
              Kredi Faizi
            </div>
            <div className="text-2xl font-bold text-(--color-primary)">%{bank.loanRate}</div>
          </div>

          <div className="rounded-lg border bg-(--color-surface) p-4">
            <div className="mb-1 flex items-center gap-1 text-xs text-(--color-foreground-muted)">
              <TrendingUp className="h-3 w-3" />
              Mevduat Faizi
            </div>
            <div className="text-2xl font-bold">%{bank.depositRate}</div>
          </div>
        </div>

        {/* Advantages */}
        <div>
          <h4 className="mb-2 text-sm font-semibold">Avantajlar</h4>
          <ul className="space-y-1">
            {bank.advantages.map((advantage, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-(--color-foreground-muted)">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-(--color-success)" />
                {advantage}
              </li>
            ))}
          </ul>
        </div>

        {/* Campaigns */}
        {bank.campaigns.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">Güncel Kampanyalar</h4>
            <div className="space-y-2">
              {bank.campaigns.map((campaign, index) => (
                <div key={index} className="rounded-lg bg-(--color-primary)/5 p-2 text-xs text-(--color-primary)">
                  {campaign}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <Button asChild className="w-full">
          <Link href={`/bankalar/${bank.id}`}>
            Detaylı Bilgi
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
