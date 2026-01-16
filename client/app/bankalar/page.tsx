import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Banka Karşılaştırma | Finanscözüm",
  description: "Bu sayfa yakında eklenecek.",
}

// Bankalar sayfası henüz kodlanmadı - erişimi engelle
export default function BanksPage() {
  notFound()
}
