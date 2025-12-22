"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toolsApi, Tool, ToolCategory } from '@/lib/tools-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { Plus, Edit, Trash2, Search, Eye, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { RequireAuth } from '@/components/auth/require-auth'

function AdminToolsPageContent() {
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<ToolCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [toolsData, categoriesData] = await Promise.all([
        toolsApi.getAll(undefined, undefined, true),
        toolsApi.getCategories(true),
      ])
      setTools(toolsData)
      setCategories(categoriesData)
    } catch (error: any) {
      console.error('Veriler yüklenirken hata:', error)
      toast.error('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (tool: Tool) => {
    setToolToDelete(tool)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!toolToDelete) return

    setIsDeleting(true)
    try {
      await toolsApi.delete(toolToDelete.id)
      toast.success('Araç başarıyla silindi')
      setDeleteDialogOpen(false)
      setToolToDelete(null)
      await loadData()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Araç silinemedi'
      console.error('Araç silme hatası:', error)
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      !searchQuery ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.slug.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || tool.status === statusFilter
    const matchesCategory =
      categoryFilter === 'all' || tool.categoryId === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      PUBLISHED: 'default',
      DRAFT: 'secondary',
      ARCHIVED: 'destructive',
    }
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status === 'PUBLISHED' ? 'Yayında' : status === 'DRAFT' ? 'Taslak' : 'Arşivlendi'}
      </Badge>
    )
  }

  const getDataSourceBadge = (type: string) => {
    const colors: Record<string, string> = {
      STATIC: 'bg-blue-100 text-blue-800',
      DATABASE: 'bg-green-100 text-green-800',
      EXTERNAL_API: 'bg-purple-100 text-purple-800',
    }
    return (
      <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>
        {type === 'STATIC' ? 'Statik' : type === 'DATABASE' ? 'Veritabanı' : 'Dış API'}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-(--color-background)">
      <div className="border-b bg-(--color-card)">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard'a Dön
              </Link>
            </Button>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Araç Yönetimi</h1>
              <p className="text-(--color-foreground-muted)">Finansal hesaplama araçlarını yönetin</p>
            </div>
            <Button asChild size="lg">
              <Link href="/admin/araclar/yeni">
                <Plus className="mr-2 h-5 w-5" />
                Yeni Araç Ekle
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Filtreler */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-foreground-muted)" />
                <Input
                  placeholder="Araç ara..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="PUBLISHED">Yayında</SelectItem>
                  <SelectItem value="DRAFT">Taslak</SelectItem>
                  <SelectItem value="ARCHIVED">Arşivlendi</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Araç Listesi */}
        <div className="space-y-4">
          {filteredTools.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-(--color-foreground-muted)">Henüz araç eklenmemiş</p>
                <Button asChild className="mt-4">
                  <Link href="/admin/araclar/yeni">İlk Aracı Ekle</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredTools.map((tool) => (
              <Card key={tool.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        {getStatusBadge(tool.status)}
                        {getDataSourceBadge(tool.dataSourceType)}
                        {tool.isFeatured && <Badge variant="outline">Öne Çıkan</Badge>}
                        {tool.category && <Badge variant="secondary">{tool.category.name}</Badge>}
                      </div>
                      <h3 className="mb-2 text-xl font-bold">{tool.name}</h3>
                      <p className="mb-2 text-(--color-foreground-muted) line-clamp-2">
                        {tool.description || 'Açıklama yok'}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-(--color-foreground-muted)">
                        <span>Component: {tool.component}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {tool.views.toLocaleString('tr-TR')} görüntülenme
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/araclar/${tool.slug}`} target="_blank">
                          <Eye className="mr-2 h-4 w-4" />
                          Görüntüle
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/araclar/${tool.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
                        onClick={() => handleDelete(tool)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Silme Onay Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Araç Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {toolToDelete?.name} adlı aracı silmek istediğinizden emin misiniz? Bu işlem
              geri alınamaz ve araçla ilişkili tüm reklam alanları ve sync job'ları da
              silinecektir.
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

export default function AdminToolsPage() {
  return (
    <RequireAuth requireAdmin>
      <AdminToolsPageContent />
    </RequireAuth>
  )
}

