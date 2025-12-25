"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToolComponentProps } from './registry'

export default function InterestCalculator({ config }: ToolComponentProps) {
  const [principal, setPrincipal] = useState(config?.defaultValues?.principal || 100000)
  const [rate, setRate] = useState(config?.defaultValues?.rate || 10)
  const [time, setTime] = useState(config?.defaultValues?.time || 12)
  const [type, setType] = useState<'simple' | 'compound'>('simple')
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    if (type === 'simple') {
      const interest = principal * (rate / 100) * (time / 12)
      setResult({
        interest,
        total: principal + interest,
      })
    } else {
      const total = principal * Math.pow(1 + rate / 100, time / 12)
      const interest = total - principal
      setResult({
        interest,
        total,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faiz Hesaplama</CardTitle>
        <CardDescription>Basit ve bileşik faiz hesaplamaları yapın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type">Faiz Türü</Label>
          <Select value={type} onValueChange={(v: 'simple' | 'compound') => setType(v)}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Basit Faiz</SelectItem>
              <SelectItem value="compound">Bileşik Faiz</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="principal">Ana Para (₺)</Label>
          <Input
            id="principal"
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            min={1000}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate">Yıllık Faiz Oranı (%)</Label>
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
          <Label htmlFor="time">Süre (Ay)</Label>
          <Input
            id="time"
            type="number"
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            min={1}
            max={120}
          />
        </div>
        <Button onClick={calculate} className="w-full">
          Hesapla
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
              <span>Faiz:</span>
              <span className="font-bold">{result.interest.toFixed(2)} ₺</span>
            </div>
            <div className="flex justify-between">
              <span>Toplam:</span>
              <span className="font-bold">{result.total.toFixed(2)} ₺</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


