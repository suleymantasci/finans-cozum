import type { Metadata } from "next"
import LoanCalculatorClient from "./loanCalculatorClient"

export const metadata: Metadata = {
  title: "Kredi Hesaplama | Finanscözüm",
  description:
    "İhtiyaç, konut ve taşıt kredisi hesaplama aracı. Aylık taksit tutarını, toplam ödeme ve faiz maliyetini öğrenin.",
  keywords: "kredi hesaplama, taksit hesaplama, konut kredisi, ihtiyaç kredisi, taşıt kredisi",
}

export default function LoanCalculatorPage() {
  return <LoanCalculatorClient />
}
