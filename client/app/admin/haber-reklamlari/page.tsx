"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { newsAdsApi, NewsAdSlot, NewsAdSlotPosition, CreateNewsAdSlotDto } from '@/lib/news-ads-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Megaphone, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { RequireAuth } from '@/components/auth/require-auth'

function NewsAdSlotsPageContent() {
  const [adSlots, setAdSlots] = useState<NewsAdSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [slotToDelete, setSlotToDelete] = useState<NewsAdSlot | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await newsAdsApi.getAll(true)
      setAdSlots(data)
    } catch (error: any) {
      console.error('Veriler yüklenemedi:', error)
      toast.error('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (slot: NewsAdSlot) => {
    setSlotToDelete(slot)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!slotToDelete) return

    setIsDeleting(true)
    try {
      await newsAdsApi.delete(slotToDelete.id)
      toast.success('Reklam alanı başarıyla silindi')
      setDeleteDialogOpen(false)
      setSlotToDelete(null)
      await loadData()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Reklam alanı silinemedi'
      console.error('Reklam alanı silme hatası:', error)
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const getPositionLabel = (position: NewsAdSlotPosition) => {
    const labels: Record<NewsAdSlotPosition, string> = {
      TOP: 'Üst (Liste Sayfası)',
      BETWEEN_NEWS: 'Haberler Arası (Liste Sayfası)',
      SIDEBAR_LEFT: 'Sol Sidebar (Detay Sayfası)',
      SIDEBAR_RIGHT: 'Sağ Sidebar (Detay Sayfası)',
      AFTER_IMAGE: 'Görsel Sonrası (Detay Sayfası)',
      IN_CONTENT: 'İçerik İçinde (Detay Sayfası)',
      BOTTOM: 'Alt (Her İki Sayfa)',
    }
    return labels[position] || position
  }

  const groupedSlots = adSlots.reduce((acc, slot) => {
    if (!acc[slot.position]) {
      acc[slot.position] = []
    }
    acc[slot.position].push(slot)
    return acc
  }, {} as Record<NewsAdSlotPosition, NewsAdSlot[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-(--color-background)">
      <div className="border-b bg-(--color-card)">
        <div className="container mx-auto px-4 py-6">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard'a Dön
            </Link>
          </Button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Haber Reklamları</h1>
              <p className="text-(--color-foreground-muted)">
                Tüm haber sayfalarında gösterilecek reklam alanlarını yönetin
              </p>
            </div>
            <Link href="/admin/haber-reklamlari/yeni">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Yeni Reklam Alanı Ekle
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 rounded-lg border bg-blue-50 p-4 dark:bg-blue-900/20">
          <h3 className="mb-2 font-semibold">Haber Reklamları Hakkında</h3>
          <p className="text-sm text-(--color-foreground-muted)">
            Burada eklediğiniz reklamlar tüm haber sayfalarında otomatik olarak gösterilir.
            Tek tek haber bazında reklam eklemenize gerek yoktur. Reklamlar pozisyonlarına göre
            liste sayfasında veya detay sayfasında gösterilir.
          </p>
          <div className="mt-3 text-sm">
            <p className="font-medium mb-1">Pozisyonlar:</p>
            <ul className="list-disc list-inside space-y-1 text-(--color-foreground-muted)">
              <li><strong>Üst:</strong> Liste sayfasının en üstünde</li>
              <li><strong>Haberler Arası:</strong> Liste sayfasında her 3 haberden sonra</li>
              <li><strong>Sol/Sağ Sidebar:</strong> Detay sayfasında içeriğin yanında</li>
              <li><strong>Görsel Sonrası:</strong> Detay sayfasında görselden sonra</li>
              <li><strong>İçerik İçinde:</strong> Detay sayfasında içerikten sonra</li>
              <li><strong>Alt:</strong> Her iki sayfanın en altında</li>
            </ul>
          </div>
        </div>

        {Object.keys(groupedSlots).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Megaphone className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-(--color-foreground-muted)">Henüz reklam alanı eklenmemiş</p>
              <Link href="/admin/haber-reklamlari/yeni">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Reklam Alanını Ekle
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSlots).map(([position, slots]) => (
              <Card key={position}>
                <CardHeader>
                  <CardTitle>{getPositionLabel(position as NewsAdSlotPosition)}</CardTitle>
                  <CardDescription>
                    {slots.length} reklam alanı
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-start justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span className={`rounded-full px-2 py-1 text-xs ${
                              slot.isActive
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {slot.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                            <span className="rounded-full px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              Sıra: {slot.order}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-(--color-foreground-muted)">
                            {slot.content && (
                              <p className="line-clamp-2">
                                <strong>İçerik:</strong> {slot.content.substring(0, 100)}...
                              </p>
                            )}
                            {slot.scriptUrl && (
                              <p><strong>Script URL:</strong> {slot.scriptUrl}</p>
                            )}
                            {slot.imageUrl && (
                              <p><strong>Görsel URL:</strong> {slot.imageUrl}</p>
                            )}
                            <div className="flex gap-4 text-xs">
                              <span>Mobil: {slot.showOnMobile ? '✓' : '✗'}</span>
                              <span>Tablet: {slot.showOnTablet ? '✓' : '✗'}</span>
                              <span>Desktop: {slot.showOnDesktop ? '✓' : '✗'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/admin/haber-reklamlari/${slot.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="mr-2 h-4 w-4" />
                              Düzenle
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
                            onClick={() => handleDelete(slot)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Silme Onay Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reklam Alanı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu reklam alanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Siliniyor...' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function NewsAdSlotsPage() {
  return (
    <RequireAuth requireAdmin>
      <NewsAdSlotsPageContent />
    </RequireAuth>
  )
}

