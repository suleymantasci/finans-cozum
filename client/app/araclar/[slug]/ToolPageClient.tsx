"use client"

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AdSlotDisplay } from '@/components/tools/AdSlotDisplay'
import { Tool, ToolAdSlot } from '@/lib/tools-api'
import { getToolComponent } from '@/components/tools/registry'

interface ToolPageClientProps {
  tool: Tool
  toolData: any
  adSlotsByPosition: {
    TOP: ToolAdSlot[]
    MIDDLE: ToolAdSlot[]
    BOTTOM: ToolAdSlot[]
    SIDEBAR_LEFT: ToolAdSlot[]
    SIDEBAR_RIGHT: ToolAdSlot[]
    INLINE: ToolAdSlot[]
  }
}

export function ToolPageClient({
  tool,
  toolData,
  adSlotsByPosition,
}: ToolPageClientProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const ToolComponent = getToolComponent(tool.component)

  if (!ToolComponent) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Hata</CardTitle>
            <CardDescription>
              Araç bileşeni bulunamadı: {tool.component}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* TOP Ad Slots */}
      {adSlotsByPosition.TOP.length > 0 && (
        <div className="mb-6">
          {adSlotsByPosition.TOP.map((slot) => (
            <AdSlotDisplay key={slot.id} slot={slot} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* SIDEBAR_LEFT */}
        {adSlotsByPosition.SIDEBAR_LEFT.length > 0 && (
          <aside className="lg:col-span-3">
            {adSlotsByPosition.SIDEBAR_LEFT.map((slot) => (
              <AdSlotDisplay key={slot.id} slot={slot} />
            ))}
          </aside>
        )}

        {/* Main Content */}
        <main
          className={`${
            adSlotsByPosition.SIDEBAR_LEFT.length > 0 || adSlotsByPosition.SIDEBAR_RIGHT.length > 0
              ? 'lg:col-span-6'
              : 'lg:col-span-12'
          }`}
        >
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="mb-4 text-4xl font-bold">{tool.name}</h1>
              {tool.description && (
                <p className="text-lg text-(--color-foreground-muted)">
                  {tool.description}
                </p>
              )}
            </div>
            <Button
              variant={isFavorite ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className="shrink-0"
            >
              <Star className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Favorilerde' : 'Favorilere Ekle'}
            </Button>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <ToolComponent
                config={tool.config}
                toolId={tool.id}
                data={toolData}
                dataSourceType={tool.dataSourceType}
              />
            </CardContent>
          </Card>

          {/* INLINE Ad Slots (component içinde) */}
          {adSlotsByPosition.INLINE.length > 0 && (
            <div className="my-6">
              {adSlotsByPosition.INLINE.map((slot) => (
                <AdSlotDisplay key={slot.id} slot={slot} />
              ))}
            </div>
          )}

          {/* MIDDLE Ad Slots */}
          {adSlotsByPosition.MIDDLE.length > 0 && (
            <div className="my-6">
              {adSlotsByPosition.MIDDLE.map((slot) => (
                <AdSlotDisplay key={slot.id} slot={slot} />
              ))}
            </div>
          )}
        </main>

        {/* SIDEBAR_RIGHT */}
        {adSlotsByPosition.SIDEBAR_RIGHT.length > 0 && (
          <aside className="lg:col-span-3">
            {adSlotsByPosition.SIDEBAR_RIGHT.map((slot) => (
              <AdSlotDisplay key={slot.id} slot={slot} />
            ))}
          </aside>
        )}
      </div>

      {/* BOTTOM Ad Slots */}
      {adSlotsByPosition.BOTTOM.length > 0 && (
        <div className="mt-6">
          {adSlotsByPosition.BOTTOM.map((slot) => (
            <AdSlotDisplay key={slot.id} slot={slot} />
          ))}
        </div>
      )}
    </div>
  )
}

