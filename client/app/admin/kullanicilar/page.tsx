"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Loader2, ChevronLeft, ChevronRight, Users, Trash2, Power } from "lucide-react"
import { usersApi, User, UsersListResponse } from "@/lib/users-api"
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

const ITEMS_PER_PAGE = 10

function UsersPageContent() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [toggleActiveDialogOpen, setToggleActiveDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [currentPage])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const offset = (currentPage - 1) * ITEMS_PER_PAGE
      const response = await usersApi.getAll(searchTerm || undefined, ITEMS_PER_PAGE, offset)
      setUsers(response.items)
      setTotal(response.total)
    } catch (error: any) {
      console.error('Kullanıcılar yüklenirken hata:', error)
      toast.error(error.message || 'Kullanıcılar yüklenemedi')
      setUsers([])
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  const handleSearch = () => {
    setIsSearching(true)
    setCurrentPage(1) // Arama yapıldığında ilk sayfaya dön
    loadUsers()
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') {
      return (
        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
          Admin
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">Kullanıcı</Badge>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Aktif
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
        Pasif
      </Badge>
    )
  }

  const handleToggleActive = async () => {
    if (!selectedUser) return

    try {
      setIsProcessing(true)
      await usersApi.update(selectedUser.id, { isActive: !selectedUser.isActive })
      toast.success(`Kullanıcı ${selectedUser.isActive ? 'pasif' : 'aktif'} hale getirildi`)
      loadUsers()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'İşlem başarısız'
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
      setToggleActiveDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return

    try {
      setIsProcessing(true)
      await usersApi.delete(selectedUser.id)
      toast.success('Kullanıcı başarıyla silindi')
      loadUsers()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Kullanıcı silinemedi'
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
      setDeleteDialogOpen(false)
      setSelectedUser(null)
    }
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
              <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
              <p className="text-(--color-foreground-muted)">Tüm kullanıcıları görüntüleyin ve yönetin</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-foreground-muted)" />
                <Input
                  placeholder="E-posta, ad veya soyad ile ara..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="sm:w-auto"
              >
                {isSearching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Ara
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-(--color-foreground-muted)">
            Toplam {total} kullanıcı bulundu
          </p>
        </div>

        <div className="space-y-4">
          {users.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-(--color-foreground-muted)" />
                <p className="text-(--color-foreground-muted)">Kullanıcı bulunamadı</p>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.isActive)}
                        {user.emailVerified && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            E-posta Doğrulanmış
                          </Badge>
                        )}
                      </div>
                      <h3 className="mb-2 text-xl font-bold">
                        {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'İsimsiz Kullanıcı'}
                      </h3>
                      <p className="mb-2 text-(--color-foreground-muted)">{user.email}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-(--color-foreground-muted)">
                        {user.phone && (
                          <>
                            <span>Tel: {user.phone}</span>
                            <span>•</span>
                          </>
                        )}
                        {user.birthDate && (
                          <>
                            <span>Doğum: {format(new Date(user.birthDate), 'dd MMMM yyyy', { locale: tr })}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>Kayıt: {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: tr })}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user)
                          setToggleActiveDialogOpen(true)
                        }}
                        disabled={isProcessing || user.role === 'ADMIN'}
                        title={user.role === 'ADMIN' ? 'Admin kullanıcılar pasife alınamaz' : user.isActive ? 'Pasife Al' : 'Aktifleştir'}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 bg-transparent"
                        onClick={() => {
                          setSelectedUser(user)
                          setDeleteDialogOpen(true)
                        }}
                        disabled={isProcessing || user.role === 'ADMIN'}
                        title={user.role === 'ADMIN' ? 'Admin kullanıcılar silinemez' : 'Sil'}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Önceki
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Sadece ilk, son ve mevcut sayfa civarındaki sayfaları göster
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      disabled={isLoading}
                    >
                      {page}
                    </Button>
                  )
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2">...</span>
                }
                return null
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || isLoading}
            >
              Sonraki
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Toggle Active Dialog */}
        <AlertDialog open={toggleActiveDialogOpen} onOpenChange={setToggleActiveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kullanıcı Durumunu Değiştir</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedUser?.isActive
                  ? `${selectedUser.email} adresli kullanıcıyı pasif hale getirmek istediğinize emin misiniz? Pasif kullanıcılar sisteme giriş yapamaz.`
                  : `${selectedUser?.email} adresli kullanıcıyı aktif hale getirmek istediğinize emin misiniz?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>İptal</AlertDialogCancel>
              <AlertDialogAction onClick={handleToggleActive} disabled={isProcessing}>
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {selectedUser?.isActive ? 'Pasife Al' : 'Aktifleştir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kullanıcıyı Silmek İstediğinizden Emin Misiniz?</AlertDialogTitle>
              <AlertDialogDescription>
                Bu işlem geri alınamaz. {selectedUser?.email} adresli kullanıcı kalıcı olarak silinecektir.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isProcessing}
                className="bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default function UsersPage() {
  return (
    <RequireAuth requireAdmin>
      <UsersPageContent />
    </RequireAuth>
  )
}

