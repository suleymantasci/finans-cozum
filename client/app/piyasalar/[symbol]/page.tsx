import type { Metadata } from "next"
import MarketDetailClient from "./marketDetailClient"

type Props = {
  params: Promise<{ symbol: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { symbol } = await params
  const displaySymbol = symbol.replace(/-/g, "/").toUpperCase()

  return {
    title: `${displaySymbol} Canlı Fiyat, Grafik ve Analiz | Finanscözüm`,
    description: `${displaySymbol} canlı fiyat, geçmiş veriler, teknik analiz ve detaylı grafik. Anlık piyasa verileri ve yorum.`,
    keywords: `${displaySymbol}, canlı fiyat, grafik, teknik analiz, piyasa verileri`,
  }
}

export default async function MarketDetailPage({ params }: Props) {
  const { symbol } = await params

  return <MarketDetailClient symbol={symbol} />
}
