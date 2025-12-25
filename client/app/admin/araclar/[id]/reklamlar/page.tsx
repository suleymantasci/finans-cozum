"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toolsApi, ToolAdSlot, AdSlotTemplate, CreateAdSlotDto, AdSlotPosition } from '@/lib/tools-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { ArrowLeft, Plus, Edit, Trash2, Megaphone, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { RequireAuth } from '@/components/auth/require-auth'

function AdSlotsPageContent() {
  const params = useParams()
  const router = useRouter()
  const toolId = params.id as string
  const [loading, setLoading] = useState(true)
  const [adSlots, setAdSlots] = useState<ToolAdSlot[]>([])
  const [templates, setTemplates] = useState<AdSlotTemplate[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [slotToDelete, setSlotToDelete] = useState<ToolAdSlot | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [tool, setTool] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [toolId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [toolData, slotsData, templatesData] = await Promise.all([
        toolsApi.getOne(toolId),
        toolsApi.getAdSlots(toolId),
        toolsApi.getTemplates(),
      ])
      setTool(toolData)
      setAdSlots(slotsData)
      setTemplates(templatesData)
    } catch (error: any) {
      console.error('Veriler yüklenemedi:', error)
      toast.error('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (slot: ToolAdSlot) => {
    setSlotToDelete(slot)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!slotToDelete) return

    setIsDeleting(true)
    try {
      await toolsApi.deleteAdSlot(slotToDelete.id)
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

  const getPositionLabel = (position: AdSlotPosition) => {
    const labels: Record<AdSlotPosition, string> = {
      TOP: 'Üst',
      SIDEBAR_LEFT: 'Sol Sidebar',
      SIDEBAR_RIGHT: 'Sağ Sidebar',
      MIDDLE: 'Orta',
      BOTTOM: 'Alt',
      INLINE: 'Satır İçi',
    }
    return labels[position] || position
  }

  const groupedSlots = adSlots.reduce((acc, slot) => {
    if (!acc[slot.position]) {
      acc[slot.position] = []
    }
    acc[slot.position].push(slot)
    return acc
  }, {} as Record<AdSlotPosition, ToolAdSlot[]>)

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
            <Link href={`/admin/araclar/${toolId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Araç Düzenlemeye Dön
            </Link>
          </Button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Reklam Alanları</h1>
              <p className="text-(--color-foreground-muted)">{tool?.name} için reklam alanlarını yönetin</p>
            </div>
            <Link href={`/admin/araclar/${toolId}/reklamlar/yeni`}>
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
          <h3 className="mb-2 font-semibold">Reklam Alanları Hakkında</h3>
          <p className="text-sm text-(--color-foreground-muted)">
            Reklam alanları, araç sayfasında farklı pozisyonlarda gösterilebilir. Her pozisyon için birden fazla reklam alanı ekleyebilirsiniz.
            Reklam alanları, Google Ads gibi reklam kodlarını içerebilir veya görsel reklamlar olabilir.
          </p>
          <div className="mt-3 text-sm">
            <p className="font-medium mb-1">Pozisyonlar:</p>
            <ul className="list-disc list-inside space-y-1 text-(--color-foreground-muted)">
              <li><strong>Üst:</strong> Sayfanın en üstünde, başlıktan önce</li>
              <li><strong>Sol/Sağ Sidebar:</strong> Ana içeriğin yanında</li>
              <li><strong>Orta:</strong> Component'ten sonra, içerik ortasında</li>
              <li><strong>Alt:</strong> Sayfanın en altında</li>
              <li><strong>Satır İçi:</strong> Component içinde, araçla birlikte</li>
            </ul>
          </div>
        </div>

        {Object.keys(groupedSlots).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Megaphone className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-(--color-foreground-muted)">Henüz reklam alanı eklenmemiş</p>
              <Link href={`/admin/araclar/${toolId}/reklamlar/yeni`}>
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
                  <CardTitle>{getPositionLabel(position as AdSlotPosition)}</CardTitle>
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
                            {slot.template && (
                              <span className="rounded-full px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                Şablon: {slot.template.name}
                              </span>
                            )}
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
                          <Link href={`/admin/araclar/${toolId}/reklamlar/${slot.id}`}>
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

export default function AdSlotsPage() {
  return (
    <RequireAuth requireAdmin>
      <AdSlotsPageContent />
    </RequireAuth>
  )
}


