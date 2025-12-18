import type { Metadata } from "next"
import MarketsClientPage from "./marketsClientPage"

export const metadata: Metadata = {
  title: "Canlı Piyasa Verileri | Finanscözüm",
  description: "Döviz kurları, kripto paralar, borsa ve altın fiyatlarını canlı takip edin.",
  keywords: "canlı döviz kurları, bitcoin fiyatı, borsa, altın fiyatları, piyasa verileri",
}

export default function MarketsPage() {
  return <MarketsClientPage />
}
