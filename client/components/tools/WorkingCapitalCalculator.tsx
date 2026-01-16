"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Çalışma Sermayesi Hesaplama
 * Çalışma Sermayesi = Dönen Varlıklar - Kısa Vadeli Borçlar
 */
export default function WorkingCapitalCalculator({ config }: ToolComponentProps) {
  const [currentAssets, setCurrentAssets] = useState(config?.defaultValues?.currentAssets || 200000)
  const [currentLiabilities, setCurrentLiabilities] = useState(config?.defaultValues?.currentLiabilities || 100000)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const workingCapital = currentAssets - currentLiabilities
    const workingCapitalRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0

    setResult({
      currentAssets,
      currentLiabilities,
      workingCapital,
      workingCapitalRatio,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Çalışma Sermayesi Hesaplama</CardTitle>
        <CardDescription>İşletmenin kısa vadeli finansal sağlığını ölçün</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentAssets">Dönen Varlıklar (₺)</Label>
          <FormattedNumberInput
            id="currentAssets"
            value={currentAssets}
            onChange={(val) => setCurrentAssets(val || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentLiabilities">Kısa Vadeli Borçlar (₺)</Label>
          <FormattedNumberInput
            id="currentLiabilities"
            value={currentLiabilities}
            onChange={(val) => setCurrentLiabilities(val || 0)}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Hesapla
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between border-b pb-2">
              <span>Çalışma Sermayesi:</span>
              <span className={`font-bold text-lg ${result.workingCapital >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.workingCapital.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
              </span>
            </div>
            <div className="flex justify-between">
              <span>Çalışma Sermayesi Oranı:</span>
              <span className="font-bold">{result.workingCapitalRatio.toFixed(2)}x</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {result.workingCapital >= 0 
                ? '✅ Pozitif çalışma sermayesi - likidite yeterli'
                : '⚠️ Negatif çalışma sermayesi - likidite riski var'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
