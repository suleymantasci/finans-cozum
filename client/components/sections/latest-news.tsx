"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Clock, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { newsApi, News } from "@/lib/news-api"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

export function LatestNews() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      const response = await newsApi.getPublished(undefined, 3) // En son 3 haber
      setNews(response.items)
      setLoading(false)
    } catch (error) {
      console.error('Haberler yüklenemedi:', error)
      setLoading(false)
    }
  }

  const formatTimeAgo = (date: string | Date | undefined) => {
    if (!date) return '--'
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: tr })
    } catch {
      return '--'
    }
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Son Haberler</h2>
            <p className="text-lg text-(--color-foreground-muted)">Finans dünyasından güncel gelişmeler</p>
          </div>
          <Button asChild variant="outline" className="hidden md:flex bg-transparent">
            <Link href="/haberler">
              Tüm Haberler
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={`loading-${index}`} className="overflow-hidden">
                <div className="aspect-video relative overflow-hidden bg-(--color-muted)">
                  <div className="flex h-full w-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-(--color-foreground-muted)" />
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Yükleniyor...</Badge>
                    <span className="flex items-center gap-1 text-xs text-(--color-foreground-muted)">
                      <Clock className="h-3 w-3" />
                      --
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2">Yükleniyor...</CardTitle>
                  <CardDescription className="line-clamp-2">Yükleniyor...</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="ghost" className="w-full" disabled>
                    Devamını Oku
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-(--color-foreground-muted)">Henüz haber bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video relative overflow-hidden bg-(--color-muted)">
                  {item.featuredImage ? (
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-(--color-muted)">
                      <span className="text-(--color-foreground-muted)">Görsel Yok</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{item.category?.name || 'Genel'}</Badge>
                    <span className="flex items-center gap-1 text-xs text-(--color-foreground-muted)">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(item.publishedAt || item.createdAt)}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{item.excerpt || 'Devamını okumak için tıklayın...'}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href={`/haberler/${item.slug || item.id}`}>
                      Devamını Oku
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/haberler">
              Tüm Haberler
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
