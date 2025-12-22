"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toolsApi, AdSlotTemplate, Tool, AdSlotPosition } from '@/lib/tools-api'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Edit, Trash2, Megaphone, Loader2, ArrowLeft, CheckSquare, X } from 'lucide-react'
import { toast } from 'sonner'
import { RequireAuth } from '@/components/auth/require-auth'

function AdSlotTemplatesPageContent() {
  const [templates, setTemplates] = useState<AdSlotTemplate[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [applyDialogOpen, setApplyDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<AdSlotTemplate | null>(null)
  const [templateToApply, setTemplateToApply] = useState<AdSlotTemplate | null>(null)
  const [templateToRemove, setTemplateToRemove] = useState<AdSlotTemplate | null>(null)
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([])
  const [selectedToolIdsForRemove, setSelectedToolIdsForRemove] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [templatesData, toolsData] = await Promise.all([
        toolsApi.getTemplates(),
        toolsApi.getAll(),
      ])
      setTemplates(templatesData)
      setTools(toolsData)
    } catch (error: any) {
      console.error('Veriler yüklenemedi:', error)
      toast.error('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (template: AdSlotTemplate) => {
    setTemplateToDelete(template)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!templateToDelete) return

    setIsDeleting(true)
    try {
      await toolsApi.deleteTemplate(templateToDelete.id)
      toast.success('Şablon başarıyla silindi')
      setDeleteDialogOpen(false)
      setTemplateToDelete(null)
      await loadData()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Şablon silinemedi'
      console.error('Şablon silme hatası:', error)
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleApply = (template: AdSlotTemplate) => {
    setTemplateToApply(template)
    setSelectedToolIds([])
    setApplyDialogOpen(true)
  }

  const toggleToolSelection = (toolId: string) => {
    setSelectedToolIds((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    )
  }

  const selectAllTools = () => {
    if (selectedToolIds.length === tools.length) {
      setSelectedToolIds([])
    } else {
      setSelectedToolIds(tools.map((t) => t.id))
    }
  }

  const confirmApply = async () => {
    if (!templateToApply || selectedToolIds.length === 0) {
      toast.error('Lütfen en az bir araç seçin')
      return
    }

    setIsApplying(true)
    try {
      await toolsApi.applyTemplateToTools(templateToApply.id, selectedToolIds)
      toast.success(`Şablon ${selectedToolIds.length} araca başarıyla uygulandı`)
      setApplyDialogOpen(false)
      setTemplateToApply(null)
      setSelectedToolIds([])
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Şablon uygulanamadı'
      console.error('Şablon uygulama hatası:', error)
      toast.error(errorMessage)
    } finally {
      setIsApplying(false)
    }
  }

  const handleRemove = (template: AdSlotTemplate) => {
    setTemplateToRemove(template)
    setSelectedToolIdsForRemove([])
    setRemoveDialogOpen(true)
  }

  const toggleToolSelectionForRemove = (toolId: string) => {
    setSelectedToolIdsForRemove((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    )
  }

  const selectAllToolsForRemove = () => {
    if (selectedToolIdsForRemove.length === tools.length) {
      setSelectedToolIdsForRemove([])
    } else {
      setSelectedToolIdsForRemove(tools.map((t) => t.id))
    }
  }

  const confirmRemove = async () => {
    if (!templateToRemove || selectedToolIdsForRemove.length === 0) {
      toast.error('Lütfen en az bir araç seçin')
      return
    }

    setIsRemoving(true)
    try {
      await toolsApi.removeTemplateFromTools(templateToRemove.id, selectedToolIdsForRemove)
      toast.success(`Şablon ${selectedToolIdsForRemove.length} araçtan başarıyla kaldırıldı`)
      setRemoveDialogOpen(false)
      setTemplateToRemove(null)
      setSelectedToolIdsForRemove([])
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Şablon kaldırılamadı'
      console.error('Şablon kaldırma hatası:', error)
      toast.error(errorMessage)
    } finally {
      setIsRemoving(false)
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
              <h1 className="text-3xl font-bold">Reklam Şablonları</h1>
              <p className="text-(--color-foreground-muted)">
                Reklam şablonları oluşturun ve tüm araçlara toplu olarak uygulayın
              </p>
            </div>
            <Link href="/admin/reklam-sablonlari/yeni">
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Yeni Şablon Ekle
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 rounded-lg border bg-blue-50 p-4 dark:bg-blue-900/20">
          <h3 className="mb-2 font-semibold">Reklam Şablonları Hakkında</h3>
          <p className="text-sm text-(--color-foreground-muted)">
            Reklam şablonları oluşturarak aynı reklamı birden fazla araca toplu olarak uygulayabilirsiniz.
            Şablon oluşturduktan sonra "Tüm Araçlara Uygula" butonuna tıklayarak seçtiğiniz tüm araçlara
            aynı reklamı ekleyebilirsiniz.
          </p>
        </div>

        {templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Megaphone className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-(--color-foreground-muted)">Henüz şablon oluşturulmamış</p>
              <Link href="/admin/reklam-sablonlari/yeni">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Şablonu Oluştur
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {getPositionLabel(template.position)}
                        </span>
                        <span className={`rounded-full px-2 py-1 text-xs ${
                          template.isActive
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {template.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                      <h3 className="mb-2 text-xl font-bold">{template.name}</h3>
                      {template.description && (
                        <p className="mb-2 text-sm text-(--color-foreground-muted) line-clamp-2">
                          {template.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-(--color-foreground-muted)">
                        {template.content && (
                          <span className="line-clamp-1">
                            İçerik: {template.content.substring(0, 50)}...
                          </span>
                        )}
                        {template.scriptUrl && <span>Script: {template.scriptUrl}</span>}
                        {template.imageUrl && <span>Görsel: {template.imageUrl}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApply(template)}
                      >
                        <CheckSquare className="mr-2 h-4 w-4" />
                        Tüm Araçlara Uygula
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemove(template)}
                        className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Araçlardan Kaldır
                      </Button>
                      <Link href={`/admin/reklam-sablonlari/${template.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
                        onClick={() => handleDelete(template)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
            <AlertDialogTitle>Şablon Sil</AlertDialogTitle>
            <AlertDialogDescription>
              "{templateToDelete?.name}" adlı şablonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

      {/* Toplu Uygulama Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Şablonu Araçlara Uygula</DialogTitle>
            <DialogDescription>
              "{templateToApply?.name}" şablonunu hangi araçlara uygulamak istersiniz?
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedToolIds.length === tools.length && tools.length > 0}
                  onCheckedChange={selectAllTools}
                />
                <span className="font-medium">Tümünü Seç</span>
              </label>
              <span className="text-sm text-(--color-foreground-muted)">
                {selectedToolIds.length} / {tools.length} seçili
              </span>
            </div>
            <div className="space-y-2">
              {tools.map((tool) => (
                <label
                  key={tool.id}
                  className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedToolIds.includes(tool.id)}
                    onCheckedChange={() => toggleToolSelection(tool.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{tool.name}</p>
                    <p className="text-sm text-(--color-foreground-muted)">{tool.slug}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyDialogOpen(false)} disabled={isApplying}>
              İptal
            </Button>
            <Button onClick={confirmApply} disabled={isApplying || selectedToolIds.length === 0}>
              {isApplying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uygulanıyor...
                </>
              ) : (
                <>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  {selectedToolIds.length} Araca Uygula
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toplu Kaldırma Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Şablonu Araçlardan Kaldır</DialogTitle>
            <DialogDescription>
              "{templateToRemove?.name}" şablonunu hangi araçlardan kaldırmak istersiniz?
              <br />
              <span className="text-orange-600 dark:text-orange-400 font-medium">
                Bu işlem seçilen araçlardaki bu şablondan türetilmiş reklam alanlarını silecektir.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedToolIdsForRemove.length === tools.length && tools.length > 0}
                  onCheckedChange={selectAllToolsForRemove}
                />
                <span className="font-medium">Tümünü Seç</span>
              </label>
              <span className="text-sm text-(--color-foreground-muted)">
                {selectedToolIdsForRemove.length} / {tools.length} seçili
              </span>
            </div>
            <div className="space-y-2">
              {tools.map((tool) => (
                <label
                  key={tool.id}
                  className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedToolIdsForRemove.includes(tool.id)}
                    onCheckedChange={() => toggleToolSelectionForRemove(tool.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{tool.name}</p>
                    <p className="text-sm text-(--color-foreground-muted)">{tool.slug}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)} disabled={isRemoving}>
              İptal
            </Button>
            <Button
              onClick={confirmRemove}
              disabled={isRemoving || selectedToolIdsForRemove.length === 0}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaldırılıyor...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  {selectedToolIdsForRemove.length} Araçtan Kaldır
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdSlotTemplatesPage() {
  return (
    <RequireAuth requireAdmin>
      <AdSlotTemplatesPageContent />
    </RequireAuth>
  )
}

