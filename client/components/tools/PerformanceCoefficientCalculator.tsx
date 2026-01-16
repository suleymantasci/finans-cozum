"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Verimlilik / Performans Katsayısı Hesaplama
 * Performans Katsayısı = Çıktı / Girdi
 * Örnek: Üretim / Harcanan Kaynak
 */
export default function PerformanceCoefficientCalculator({ config }: ToolComponentProps) {
  const [output, setOutput] = useState(config?.defaultValues?.output || 1000)
  const [input, setInput] = useState(config?.defaultValues?.input || 500)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    if (input <= 0) {
      setResult({ error: 'Girdi değeri sıfırdan büyük olmalıdır!' })
      return
    }

    const efficiency = output / input
    const efficiencyPercentage = efficiency * 100

    setResult({
      output,
      input,
      efficiency,
      efficiencyPercentage,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verimlilik / Performans Katsayısı</CardTitle>
        <CardDescription>Çıktı/girdi oranını hesaplayarak verimliliği ölçün</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="output">Çıktı (Üretim/Gelir)</Label>
          <FormattedNumberInput
            id="output"
            value={output}
            onChange={(val) => setOutput(val || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="input">Girdi (Kaynak/Maliyet)</Label>
          <FormattedNumberInput
            id="input"
            value={input}
            onChange={(val) => setInput(val || 0)}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Hesapla
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            {result.error ? (
              <div className="text-red-600">{result.error}</div>
            ) : (
              <>
                <div className="flex justify-between border-b pb-2">
                  <span>Performans Katsayısı:</span>
                  <span className="font-bold text-lg">{result.efficiency.toFixed(3)}x</span>
                </div>
                <div className="flex justify-between">
                  <span>Verimlilik Oranı:</span>
                  <span className="font-bold">{result.efficiencyPercentage.toFixed(2)}%</span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {result.efficiency >= 1 
                    ? '✅ Verimli - Çıktı girdiden fazla'
                    : '⚠️ Verimsiz - Çıktı girdiden az'}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
