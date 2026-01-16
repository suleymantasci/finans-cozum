"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Ortalama Getiri Hesaplama
 * Aritmetik Ortalama: (Return1 + Return2 + ... + ReturnN) / N
 */
export default function AverageReturnCalculator({ config }: ToolComponentProps) {
  const [returns, setReturns] = useState<string[]>(['10', '15', '20', '-5', '12'])
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const returnValues = returns.map(r => parseFloat(r) || 0)
    const sum = returnValues.reduce((a, b) => a + b, 0)
    const average = sum / returnValues.length
    
    // Standart sapma hesaplama
    const variance = returnValues.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / returnValues.length
    const standardDeviation = Math.sqrt(variance)

    setResult({
      returns: returnValues,
      average,
      standardDeviation,
      count: returnValues.length,
    })
  }

  const updateReturn = (index: number, value: string) => {
    const newReturns = [...returns]
    newReturns[index] = value
    setReturns(newReturns)
  }

  const addReturn = () => {
    setReturns([...returns, '0'])
  }

  const removeReturn = (index: number) => {
    if (returns.length > 1) {
      const newReturns = returns.filter((_, i) => i !== index)
      setReturns(newReturns)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ortalama Getiri Hesaplama</CardTitle>
        <CardDescription>Yatırım getirilerinin aritmetik ortalamasını hesaplayın</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Yıllık Getiri Oranları (%)</Label>
          {returns.map((ret, index) => (
            <div key={index} className="flex gap-2">
              <FormattedNumberInput
                value={parseFloat(ret) || 0}
                onChange={(val) => updateReturn(index, val?.toString() || '0')}
                placeholder={`Getiri ${index + 1}`}
                className="flex-1"
              />
              {returns.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeReturn(index)}
                >
                  Sil
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addReturn} className="w-full">
            + Getiri Ekle
          </Button>
        </div>
        <Button onClick={calculate} className="w-full">
          Hesapla
        </Button>
        {result && (
          <div className="mt-4 space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between border-b pb-2">
              <span>Ortalama Getiri:</span>
              <span className={`font-bold text-lg ${result.average >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.average.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Standart Sapma:</span>
              <span className="font-bold">{result.standardDeviation.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Dönem Sayısı:</span>
              <span className="font-bold">{result.count}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
