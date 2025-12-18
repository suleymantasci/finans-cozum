"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoanCalculator } from "@/components/tools/loan-calculator"

export default function LoanCalculatorClient() {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="mb-4 text-4xl font-bold">Kredi Hesaplama</h1>
            <p className="text-lg text-(--color-foreground-muted)">
              İhtiyaç, konut veya taşıt kredisi hesaplayın. Aylık taksit tutarınızı ve toplam maliyeti öğrenin.
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

        <LoanCalculator />
      </div>
    </div>
  )
}
