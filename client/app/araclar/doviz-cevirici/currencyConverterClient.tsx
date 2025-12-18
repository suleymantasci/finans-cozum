"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CurrencyConverter } from "@/components/tools/currency-converter"

export default function CurrencyConverterClient() {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="mb-4 text-4xl font-bold">Döviz Çevirici</h1>
            <p className="text-lg text-(--color-foreground-muted)">
              Anlık kurlarla döviz çevirisi yapın. Tüm dünya para birimleri tek platformda.
            </p>
          </div>
          <Button
            variant={isFavorite ? "default" : "outline"}
            size="sm"
            onClick={() => setIsFavorite(!isFavorite)}
            className="shrink-0"
          >
            <Star className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
            {isFavorite ? "Favorilerde" : "Favorilere Ekle"}
          </Button>
        </div>

        <CurrencyConverter />
      </div>
    </div>
  )
}
