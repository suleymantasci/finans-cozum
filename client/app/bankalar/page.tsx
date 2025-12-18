import type { Metadata } from "next"
import { BankCard } from "@/components/banks/bank-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "Banka Karşılaştırma | Finanscözüm",
  description:
    "Türkiye'deki bankaların kredi faizleri, mevduat oranları ve avantajlarını karşılaştırın. En uygun bankayı bulun.",
  keywords: "banka karşılaştırma, kredi faizleri, mevduat oranları, en uygun banka, konut kredisi, ihtiyaç kredisi",
}

const banks = [
  {
    id: "ziraat-bankasi",
    name: "Ziraat Bankası",
    logo: "🏦",
    loanRate: "2.99",
    depositRate: "45.00",
    advantages: ["En düşük faiz oranları", "Yaygın şube ağı", "Kamu güvencesi"],
    campaigns: ["İlk ev alana özel %2.75 faiz", "Maaş promosyonu kampanyası"],
    rating: 4.5,
    badge: "En Düşük Faiz",
    color: "bg-green-500",
  },
  {
    id: "is-bankasi",
    name: "İş Bankası",
    logo: "🏛️",
    loanRate: "3.15",
    depositRate: "44.50",
    advantages: ["Güçlü dijital altyapı", "Hızlı kredi onayı", "Kapsamlı sigorta ürünleri"],
    campaigns: ["Dijital kanaldan başvuruda faiz indirimi", "Maximum kart avantajları"],
    rating: 4.6,
    badge: "Popüler",
    color: "bg-blue-500",
  },
  {
    id: "garanti-bbva",
    name: "Garanti BBVA",
    logo: "🏢",
    loanRate: "3.25",
    depositRate: "44.75",
    advantages: ["Gelişmiş mobil uygulama", "7/24 müşteri hizmetleri", "Hızlı işlem süreçleri"],
    campaigns: ["Bonus kart ile ekstra avantajlar", "Genç müşterilere özel faiz"],
    rating: 4.7,
    badge: "Dijital Avantaj",
    color: "bg-emerald-500",
  },
  {
    id: "akbank",
    name: "Akbank",
    logo: "🏦",
    loanRate: "3.10",
    depositRate: "45.25",
    advantages: ["Yüksek mevduat faizi", "Akıllı ATM ağı", "Hızlı EFT/Havale"],
    campaigns: ["Mevduat kampanyaları", "Axess kart avantajları"],
    rating: 4.5,
    badge: "Yüksek Getiri",
    color: "bg-red-500",
  },
  {
    id: "yapi-kredi",
    name: "Yapı Kredi",
    logo: "🏛️",
    loanRate: "3.18",
    depositRate: "44.80",
    advantages: ["World kart avantajları", "Kolay başvuru süreci", "Esnek taksit seçenekleri"],
    campaigns: ["World kart sahiplerine özel kampanyalar", "Genç hesap avantajları"],
    rating: 4.4,
    badge: "Avantajlı",
    color: "bg-indigo-500",
  },
  {
    id: "halkbank",
    name: "Halkbank",
    logo: "🏢",
    loanRate: "3.05",
    depositRate: "45.10",
    advantages: ["Esnaf dostu", "Uygun ticari krediler", "Devlet destekli krediler"],
    campaigns: ["KOBİ kredilerinde faiz desteği", "Çiftçi kredisi avantajları"],
    rating: 4.3,
    badge: "Esnaf Dostu",
    color: "bg-orange-500",
  },
]

export default function BanksPage() {
  const lowestLoan = banks.reduce((prev, current) =>
    Number.parseFloat(prev.loanRate) < Number.parseFloat(current.loanRate) ? prev : current,
  )
  const highestDeposit = banks.reduce((prev, current) =>
    Number.parseFloat(prev.depositRate) > Number.parseFloat(current.depositRate) ? prev : current,
  )

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Banka Karşılaştırma</h1>
        <p className="text-lg text-(--color-foreground-muted)">
          Türkiye'deki bankaların kredi faizleri, mevduat oranları ve avantajlarını karşılaştırın
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-12 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="h-5 w-5 text-(--color-success)" />
              En Düşük Kredi Faizi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-(--color-success)">%{lowestLoan.loanRate}</div>
            <p className="text-sm text-(--color-foreground-muted)">{lowestLoan.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-(--color-primary)" />
              En Yüksek Mevduat Faizi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-(--color-primary)">%{highestDeposit.depositRate}</div>
            <p className="text-sm text-(--color-foreground-muted)">{highestDeposit.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-(--color-warning)" />
              Karşılaştırılan Banka
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{banks.length}</div>
            <p className="text-sm text-(--color-foreground-muted)">Güncel verilerle</p>
          </CardContent>
        </Card>
      </div>

      {/* Bank Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {banks.map((bank) => (
          <BankCard key={bank.id} bank={bank} />
        ))}
      </div>

      {/* Info Card */}
      <Card className="mt-12 bg-(--color-surface)">
        <CardHeader>
          <CardTitle>Banka Seçerken Nelere Dikkat Etmeli?</CardTitle>
          <CardDescription>Doğru bankayı seçmek için önemli kriterler</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">Faiz Oranları</h3>
            <p className="text-sm text-(--color-foreground-muted)">
              Kredi alacaksanız en düşük, mevduat açacaksanız en yüksek faiz oranını sunan bankayı tercih edin.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Kampanyalar ve Avantajlar</h3>
            <p className="text-sm text-(--color-foreground-muted)">
              Bankaların sunduğu özel kampanyalar ve kart avantajları tasarruf etmenizi sağlayabilir.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Dijital Hizmetler</h3>
            <p className="text-sm text-(--color-foreground-muted)">
              Mobil bankacılık ve internet şubesi hizmetlerinin kalitesi günlük işlemlerinizi kolaylaştırır.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Müşteri Hizmetleri</h3>
            <p className="text-sm text-(--color-foreground-muted)">
              7/24 destek ve hızlı problem çözme kabiliyeti önemli bir kriter olmalıdır.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
