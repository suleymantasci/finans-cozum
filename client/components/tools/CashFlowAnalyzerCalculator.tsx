"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToolComponentProps } from './registry'
import { FormattedNumberInput } from '@/lib/utils/number-input'

/**
 * Nakit Akışı Analizi
 * Giriş ve çıkışları analiz ederek net nakit akışını hesaplar
 */
export default function CashFlowAnalyzerCalculator({ config }: ToolComponentProps) {
  const [cashInflows, setCashInflows] = useState<string[]>(['50000', '60000', '70000'])
  const [cashOutflows, setCashOutflows] = useState<string[]>(['40000', '45000', '50000'])
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    const inflows = cashInflows.map(f => parseFloat(f) || 0)
    const outflows = cashOutflows.map(f => parseFloat(f) || 0)
    
    const totalInflow = inflows.reduce((a, b) => a + b, 0)
    const totalOutflow = outflows.reduce((a, b) => a + b, 0)
    const netCashFlow = totalInflow - totalOutflow
    
    // Periyodik net akışlar
    const periodicFlows = inflows.map((inflow, i) => ({
      period: i + 1,
      inflow,
      outflow: outflows[i] || 0,
      net: inflow - (outflows[i] || 0),
    }))

    setResult({
      totalInflow,
      totalOutflow,
      netCashFlow,
      periodicFlows,
    })
  }

  const updateInflow = (index: number, value: string) => {
    const newFlows = [...cashInflows]
    newFlows[index] = value
    setCashInflows(newFlows)
  }

  const updateOutflow = (index: number, value: string) => {
    const newFlows = [...cashOutflows]
    newFlows[index] = value
    setCashOutflows(newFlows)
  }

  const addPeriod = () => {
    setCashInflows([...cashInflows, '0'])
    setCashOutflows([...cashOutflows, '0'])
  }

  const removePeriod = (index: number) => {
    if (cashInflows.length > 1) {
      setCashInflows(cashInflows.filter((_, i) => i !== index))
      setCashOutflows(cashOutflows.filter((_, i) => i !== index))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nakit Akışı Analizi</CardTitle>
        <CardDescription>Giriş ve çıkış nakit akışlarını analiz edin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Dönemsel Nakit Akışları (₺)</Label>
          {cashInflows.map((_, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <FormattedNumberInput
                  value={parseFloat(cashInflows[index]) || 0}
                  onChange={(val) => updateInflow(index, val?.toString() || '0')}
                  placeholder={`Dönem ${index + 1} Giriş`}
                />
              </div>
              <div className="flex-1">
                <FormattedNumberInput
                  value={parseFloat(cashOutflows[index]) || 0}
                  onChange={(val) => updateOutflow(index, val?.toString() || '0')}
                  placeholder={`Dönem ${index + 1} Çıkış`}
                />
              </div>
              {cashInflows.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removePeriod(index)}
                >
                  Sil
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addPeriod} className="w-full">
            + Dönem Ekle
          </Button>
        </div>
        <Button onClick={calculate} className="w-full">
          Analiz Et
        </Button>
        {result && (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between mb-2">
                <span>Toplam Giriş:</span>
                <span className="font-bold text-green-600">{result.totalInflow.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Toplam Çıkış:</span>
                <span className="font-bold text-red-600">{result.totalOutflow.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Net Nakit Akışı:</span>
                <span className={`font-bold text-lg ${result.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.netCashFlow.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                </span>
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Dönem</th>
                    <th className="p-2 text-right">Giriş</th>
                    <th className="p-2 text-right">Çıkış</th>
                    <th className="p-2 text-right">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {result.periodicFlows.map((row: any) => (
                    <tr key={row.period} className="border-t">
                      <td className="p-2">{row.period}</td>
                      <td className="p-2 text-right text-green-600">{row.inflow.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
                      <td className="p-2 text-right text-red-600">{row.outflow.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</td>
                      <td className={`p-2 text-right font-bold ${row.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {row.net.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
