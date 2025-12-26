"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { toolsApi, Tool } from "@/lib/tools-api"
import { getToolIcon } from "@/components/icons/tool-icons"

export function FeaturedTools() {
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFeaturedTools = async () => {
      try {
        setIsLoading(true)
        const featuredTools = await toolsApi.getFeatured(6)
        setTools(featuredTools)
      } catch (error) {
        console.error('Featured tools yüklenemedi:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFeaturedTools()
  }, [])
  return (
    <section className="border-t bg-(--color-background) py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Popüler Finans Araçları</h2>
          <p className="mx-auto max-w-2xl text-lg text-(--color-foreground-muted)">
            Finansal hesaplamalarınızı kolaylaştıran, kullanımı basit ve güvenilir araçlarımızla tanışın
          </p>
        </div>

        {/* Tools Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="mb-4 h-12 w-12 rounded-lg bg-(--color-muted)" />
                  <div className="h-6 w-3/4 rounded bg-(--color-muted)" />
                  <div className="mt-2 h-4 w-full rounded bg-(--color-muted)" />
                </CardHeader>
                <CardFooter>
                  <div className="h-9 w-24 rounded bg-(--color-muted)" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : tools.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => {
              const IconComponent = getToolIcon(tool.icon)
              // Hex kod formatında renkler geldiği için style attribute kullanıyoruz
              // Eğer hex formatında ise direkt kullan, değilse opacity ile rgba'ya çevir
              const getBgColor = (color?: string) => {
                if (!color) return undefined
                // Hex formatında ise (örn: #3b82f6)
                if (color.startsWith('#')) {
                  // Opacity için rgba formatına çevir
                  const hex = color.replace('#', '')
                  const r = parseInt(hex.substring(0, 2), 16)
                  const g = parseInt(hex.substring(2, 4), 16)
                  const b = parseInt(hex.substring(4, 6), 16)
                  return `rgba(${r}, ${g}, ${b}, 0.1)`
                }
                return color
              }
              
              const bgColor = getBgColor(tool.bgColor || tool.color)
              const iconColor = tool.color || '#3b82f6' // Default primary color
              
              return (
                <Card key={tool.id} className="group transition-all hover:shadow-lg hover:border-(--color-primary)/50">
                  <CardHeader>
                    <div 
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
                      style={bgColor ? { backgroundColor: bgColor } : undefined}
                    >
                      <IconComponent 
                        className="h-6 w-6" 
                        style={{ color: iconColor }}
                      />
                    </div>
                    <CardTitle className="text-xl">{tool.name}</CardTitle>
                    <CardDescription className="text-base">{tool.description || 'Finansal hesaplama aracı'}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild variant="ghost" className="group-hover:text-(--color-primary)">
                      <Link href={`/araclar/${tool.slug}`} className="flex items-center gap-2">
                        Hesapla
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : null}

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/araclar">
              Tüm Araçları Görüntüle
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
