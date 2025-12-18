import type { Metadata } from "next"
import CurrencyConverterClient from "./currencyConverterClient"

export const metadata: Metadata = {
  title: "Döviz Çevirici | Finanscözüm",
  description: "Anlık döviz kurları ile para birimi çevirisi yapın. USD, EUR, GBP ve daha fazlası.",
  keywords: "döviz çevirici, kur hesaplama, dolar, euro, sterlin",
}

export default function CurrencyConverterPage() {
  return <CurrencyConverterClient />
}
