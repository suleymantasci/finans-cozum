"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'

export default function VadeCalculator({ config }: ToolComponentProps) {
  const [principal, setPrincipal] = useState(config?.defaultValues?.principal || 100000)
  const [rate, setRate] = useState(config?.defaultValues?.rate || 10)
  const [target, setTarget] = useState(config?.defaultValues?.target || 150000)
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const monthlyRate = rate / 100 / 12
    const months = Math.log(target / principal) / Math.log(1 + monthlyRate)
    const years = months / 12

    setResult({
      months: Math.ceil(months),
      years: years.toFixed(2),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vade Hesaplama</CardTitle>
        <CardDescription>Hedef tutara ulaşmak için gereken vadeyi hesaplayın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="principal">Başlangıç Tutarı (₺)</Label>
          <Input
            id="principal"
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            min={1000}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate">Yıllık Getiri Oranı (%)</Label>
          <Input
            id="rate"
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            min={0}
            max={100}
            step="0.1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target">Hedef Tutar (₺)</Label>
          <Input
            id="target"
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            min={principal}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Hesapla
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span>Gerekli Vade:</span>
              <span className="font-bold">{result.months} ay ({result.years} yıl)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

