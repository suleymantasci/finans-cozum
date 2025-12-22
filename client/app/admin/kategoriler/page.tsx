"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Loader2, ArrowLeft } from "lucide-react"
import { categoriesApi, Category } from "@/lib/categories-api"
import { toast } from "sonner"
import { RequireAuth } from "@/components/auth/require-auth"
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function CategoriesPageContent() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const data = await categoriesApi.getAll(true) // Tüm kategorileri getir (aktif + pasif)
      setCategories(data)
    } catch (error: any) {
      toast.error(error.message || 'Kategoriler yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return

    setIsDeleting(true)
    try {
      await categoriesApi.delete(categoryToDelete.id)
      toast.success('Kategori başarıyla silindi')
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
      // Listeyi güncelle
      await loadCategories()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Kategori silinemedi'
      toast.error(errorMessage)
      console.error('Kategori silme hatası:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-(--color-background)">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/admin" className="mb-4 inline-flex items-center text-sm text-(--color-foreground-muted) hover:text-(--color-foreground)">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Admin Paneli
            </Link>
            <h1 className="text-3xl font-bold">Kategoriler</h1>
            <p className="mt-2 text-(--color-foreground-muted)">
              Haber kategorilerini yönetin
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/kategoriler/yeni">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kategori
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {categories.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-(--color-foreground-muted)">Henüz kategori bulunamadı.</p>
                <Button asChild className="mt-4">
                  <Link href="/admin/kategoriler/yeni">
                    <Plus className="mr-2 h-4 w-4" />
                    İlk Kategoriyi Oluştur
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-xl font-bold">{category.name}</h3>
                        {!category.isActive && (
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            Pasif
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="mb-2 text-sm text-(--color-foreground-muted)">
                          {category.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-(--color-foreground-muted)">
                        <span>Slug: {category.slug}</span>
                        <span>•</span>
                        <span>Sıra: {category.order}</span>
                        {category._count && (
                          <>
                            <span>•</span>
                            <span>{category._count.news} haber</span>
                          </>
                        )}
                        <span>•</span>
                        <span>
                          {format(new Date(category.createdAt), 'dd MMM yyyy', { locale: tr })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/kategoriler/${category.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
                        onClick={() => handleDelete(category)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete?._count && categoryToDelete._count.news > 0 ? (
                <>
                  Bu kategoriye ait <strong>{categoryToDelete._count.news} haber</strong> bulunmaktadır.
                  Kategoriyi silmek için önce haberleri başka bir kategoriye taşımanız gerekmektedir.
                </>
              ) : (
                <>
                  <strong>{categoryToDelete?.name}</strong> kategorisini silmek istediğinize emin misiniz?
                  Bu işlem geri alınamaz.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
            {(!categoryToDelete?._count || categoryToDelete._count.news === 0) && (
              <AlertDialogAction 
                onClick={confirmDelete} 
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  'Sil'
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <RequireAuth requireAdmin>
      <CategoriesPageContent />
    </RequireAuth>
  )
}


