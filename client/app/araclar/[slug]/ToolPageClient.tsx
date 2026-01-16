"use client"

import { useState, useEffect } from 'react'
import { Star, Info, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AdSlotDisplay } from '@/components/tools/AdSlotDisplay'
import { Tool, ToolAdSlot } from '@/lib/tools-api'
import { getToolComponent } from '@/components/tools/registry'
import { favoriteToolsApi } from '@/lib/favorite-tools-api'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { toolDescriptions } from '@/lib/tools/tool-descriptions'

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
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(true)
  const { user } = useAuth()
  const ToolComponent = getToolComponent(tool.component)

  // Favori durumunu kontrol et
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user) {
        setIsLoadingFavorite(false)
        return
      }

      try {
        const result = await favoriteToolsApi.checkFavorite(tool.id)
        setIsFavorite(result.isFavorite)
      } catch (error) {
        console.error('Favori durumu kontrol edilemedi:', error)
      } finally {
        setIsLoadingFavorite(false)
      }
    }

    checkFavoriteStatus()
  }, [tool.id, user])

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Favorilere eklemek için giriş yapmalısınız')
      return
    }

    try {
      if (isFavorite) {
        await favoriteToolsApi.removeFavorite(tool.id)
        setIsFavorite(false)
        toast.success('Araç favorilerden kaldırıldı')
      } else {
        await favoriteToolsApi.addFavorite(tool.id)
        setIsFavorite(true)
        toast.success('Araç favorilere eklendi')
      }
    } catch (error: any) {
      console.error('Favori işlemi başarısız:', error)
      toast.error(error?.response?.data?.message || 'Bir hata oluştu')
    }
  }

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
            {user && (
              <Button
                variant={isFavorite ? 'default' : 'outline'}
                size="sm"
                onClick={handleToggleFavorite}
                disabled={isLoadingFavorite}
                className="shrink-0"
              >
                <Star className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Favorilerde' : 'Favorilere Ekle'}
              </Button>
            )}
          </div>

          <ToolComponent
            config={tool.config}
            toolId={tool.id}
            data={toolData}
            dataSourceType={tool.dataSourceType}
          />
          
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

          {/* Açıklama Bölümü */}
          {toolDescriptions[tool.slug] && (
            <div className="mt-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Bu Araç Nedir?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-(--color-foreground-muted) leading-relaxed">
                    {toolDescriptions[tool.slug].whatIs}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Nasıl Hesaplanır?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-(--color-foreground-muted) leading-relaxed mb-4">
                    {toolDescriptions[tool.slug].howItWorks}
                  </p>
                  
                  {toolDescriptions[tool.slug].formula && (
                    <div className="mt-4 rounded-lg bg-muted p-4">
                      <h4 className="mb-2 font-semibold">Formül:</h4>
                      <pre className="whitespace-pre-wrap text-sm text-(--color-foreground-muted) font-mono">
                        {toolDescriptions[tool.slug].formula}
                      </pre>
                    </div>
                  )}

                  {toolDescriptions[tool.slug].examples && toolDescriptions[tool.slug].examples!.length > 0 && (
                    <div className="mt-4">
                      <h4 className="mb-2 font-semibold">Örnek Hesaplama:</h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-(--color-foreground-muted)">
                        {toolDescriptions[tool.slug].examples!.map((example, idx) => (
                          <li key={idx}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
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

