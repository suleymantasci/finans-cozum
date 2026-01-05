"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { TrendingUp, Bell, LayoutGrid, List, Loader2, Info, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ipoApi, IpoResponse, IpoStatus } from "@/lib/ipo-api"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function HalkaArzTakvimiPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"mevcut" | "taslak">("mevcut")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [listings, setListings] = useState<IpoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [followedIPOs, setFollowedIPOs] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef(null)
  
  // Search states - separate for each tab
  const [searchMevcut, setSearchMevcut] = useState("")
  const [searchTaslak, setSearchTaslak] = useState("")
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasInitialized = useRef(false)
  const prevActiveTab = useRef<"mevcut" | "taslak">("mevcut")
  const prevSearchMevcut = useRef("")
  const prevSearchTaslak = useRef("")

  // Get current search value based on active tab
  const getCurrentSearch = useCallback(() => {
    return activeTab === "mevcut" ? searchMevcut : searchTaslak
  }, [activeTab, searchMevcut, searchTaslak])
  
  const setCurrentSearch = useCallback((value: string) => {
    if (activeTab === "mevcut") {
      setSearchMevcut(value)
    } else {
      setSearchTaslak(value)
    }
  }, [activeTab])

  const fetchListings = useCallback(async (pageNum: number, isReset: boolean, searchTerm?: string, tab?: "mevcut" | "taslak") => {
    setLoading(true)
    try {
      let limit = 50
      let statusParams: IpoStatus | IpoStatus[]
      const currentTab = tab || activeTab
      
      if (currentTab === "taslak") {
        statusParams = IpoStatus.DRAFT
        limit = 250
      } else {
        // "Mevcut" includes both Upcoming and Completed
        // By passing array, backend will use 'in' operator
        statusParams = [IpoStatus.UPCOMING, IpoStatus.COMPLETED]
      }

      const currentSearch = searchTerm !== undefined 
        ? searchTerm 
        : (currentTab === "mevcut" ? searchMevcut : searchTaslak)
      
      const response = await ipoApi.getIpoList({ 
        status: statusParams, 
        page: pageNum, 
        limit,
        search: currentSearch || undefined
      })

      const newData = response.data

      if (isReset) {
        setListings(newData)
      } else {
        setListings((prev) => [...prev, ...newData])
      }

      // Check if we reached the end
      if (newData.length < limit || response.page >= response.totalPages) {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Failed to fetch IPOs:", error)
    } finally {
      setLoading(false)
    }
  }, [activeTab, searchMevcut, searchTaslak])
  
  // Initial load and tab/search changes - unified effect
  useEffect(() => {
    // Check if values actually changed (skip if same)
    const tabChanged = prevActiveTab.current !== activeTab
    const searchMevcutChanged = prevSearchMevcut.current !== searchMevcut
    const searchTaslakChanged = prevSearchTaslak.current !== searchTaslak
    
    // Update refs
    prevActiveTab.current = activeTab
    prevSearchMevcut.current = searchMevcut
    prevSearchTaslak.current = searchTaslak

    // For initial load, fetch immediately
    if (!hasInitialized.current) {
      hasInitialized.current = true
      const currentSearch = activeTab === "mevcut" ? searchMevcut : searchTaslak
      fetchListings(1, true, currentSearch, activeTab)
      return
    }

    // Skip if nothing actually changed
    if (!tabChanged && !searchMevcutChanged && !searchTaslakChanged) {
      return
    }

    // Clear previous timeout if exists
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Reset state
    setPage(1)
    setListings([])
    setHasMore(true)

    // Debounce - wait 500ms after changes
    const currentSearch = activeTab === "mevcut" ? searchMevcut : searchTaslak
    const currentTab = activeTab
    searchTimeoutRef.current = setTimeout(() => {
      fetchListings(1, true, currentSearch, currentTab)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchMevcut, searchTaslak]) // Combined effect for initial load, tab and search changes

  // Fetch when page changes (except initial page 1 which is handled by initial load)
  useEffect(() => {
    if (page > 1) {
      const searchTerm = activeTab === "mevcut" ? searchMevcut : searchTaslak
      fetchListings(page, false, searchTerm, activeTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]) // Only depend on page - other values are read directly

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1)
        }
      },
      { threshold: 0.1 } // Trigger slightly before full visibility
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMore, loading])

  const toggleFollow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFollowedIPOs((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]))
  }

  const getLogoUrl = (path?: string) => {
    if (!path) return "/placeholder-logo.png"
    if (path.startsWith("http")) return path
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    return `${apiUrl}${path}`
  }

  // Check if BIST code should be hidden (TEMP- codes)
  const shouldHideBistCode = (bistCode: string) => {
    return bistCode.startsWith("TEMP-")
  }

  // Format BIST code for display (hide TEMP- codes)
  const formatBistCode = (bistCode: string) => {
    if (shouldHideBistCode(bistCode)) {
      return "-"
    }
    return bistCode
  }

  // Check if date should be shown (not for drafts)
  const shouldShowDate = (status: IpoStatus) => {
    return status !== IpoStatus.DRAFT
  }

  // Get link href for a listing
  // TEMP- codes can also have detail pages, they're just hidden from display
  const getListingHref = (bistCode: string) => {
    return `/halka-arz-takvimi/${bistCode}`
  }

  const renderStatusBadge = (status: IpoStatus) => {
    switch (status) {
      case IpoStatus.UPCOMING:
        return <Badge className="bg-blue-600 hover:bg-blue-700">Yaklaşan</Badge>
      case IpoStatus.COMPLETED:
        return <Badge variant="secondary">Gerçekleşti</Badge>
      case IpoStatus.DRAFT:
        return <Badge variant="outline" className="border-dashed">Taslak</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-primary/5 via-transparent to-accent/5 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <TrendingUp className="h-4 w-4" />
              Halka Arz Takibi
            </div>
            <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">Halka Arz Takvimi</h1>
            <p className="text-pretty text-lg text-muted-foreground">
              Türkiye ve dünya borsalarındaki yaklaşan ve gerçekleşen halka arzları takip edin.
            </p>
          </div>
        </div>
      </section>

      {/* IPO Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <TabsList>
                    <TabsTrigger value="mevcut">Mevcut Arzlar</TabsTrigger>
                    <TabsTrigger value="taslak">Taslaklar</TabsTrigger>
                  </TabsList>

                  <div className="flex gap-2">
                    <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Search Input */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Şirket adı veya BIST kodu ara..."
                    value={getCurrentSearch()}
                    onChange={(e) => setCurrentSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="mt-0 min-h-[400px]">
                {/* 
                  Note: We display listings if we have ANY (even if loading more). 
                  If first load and loading, show spinner.
                  If first load empty, show empty state.
                */}
                {listings.length === 0 && loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : listings.length === 0 ? (
                  <Card className="p-8 text-center text-muted-foreground">
                    Kayıt bulunamadı.
                  </Card>
                ) : (
                  <>
                  {viewMode === "list" ? (
                    <div className="hidden overflow-x-auto rounded-lg border md:block">
                      <table className="w-full">
                        <thead className="bg-secondary/30">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Şirket</th>
                            {activeTab !== "taslak" && <th className="px-4 py-3 text-left text-sm font-semibold">Kod</th>}
                            {activeTab !== "taslak" && <th className="px-4 py-3 text-left text-sm font-semibold">Tarih</th>}
                            <th className="px-4 py-3 text-center text-sm font-semibold">Durum</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold">Takip</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {listings.map((item, i) => {
                            const href = getListingHref(item.listing.bistCode)
                            
                            return (
                            <tr 
                              key={`${item.listing.id}-${i}`}
                              className="hover:bg-secondary/20 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <Link href={href} className="flex items-center gap-3 cursor-pointer">
                                  {item.listing.logoUrl ? (
                                    <img 
                                      src={getLogoUrl(item.listing.logoUrl)} 
                                      alt={item.listing.companyName}
                                      className="w-10 h-10 object-contain rounded bg-white p-0.5 border"
                                      onError={(e) => (e.currentTarget.src = "/placeholder-logo.png")}
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center text-xs font-bold">
                                      {!shouldHideBistCode(item.listing.bistCode) ? item.listing.bistCode.substring(0, 2) : "?"}
                                    </div>
                                  )}
                                  <div className="font-semibold text-sm">{item.listing.companyName}</div>
                                </Link>
                              </td>
                              {activeTab !== "taslak" && (
                                <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                                  <Link href={href} className="cursor-pointer">
                                    {formatBistCode(item.listing.bistCode)}
                                  </Link>
                                </td>
                              )}
                              {activeTab !== "taslak" && shouldShowDate(item.listing.status) && (
                                <td className="px-4 py-3 text-sm">
                                  <Link href={href} className="cursor-pointer">
                                    {item.listing.ipoDate}
                                  </Link>
                                </td>
                              )}
                              {activeTab !== "taslak" && !shouldShowDate(item.listing.status) && (
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                  -
                                </td>
                              )}
                              <td className="px-4 py-3 text-center">
                                {renderStatusBadge(item.listing.status)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Button
                                  variant={followedIPOs.includes(item.listing.id) ? "default" : "outline"}
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => toggleFollow(item.listing.id, e)}
                                >
                                  <Bell className="h-3.5 w-3.5" />
                                </Button>
                              </td>
                            </tr>
                          )})}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {listings.map((item, i) => {
                        const href = getListingHref(item.listing.bistCode)
                        return (
                          <Link key={`${item.listing.id}-${i}`} href={href}>
                            <Card className="p-4 hover:border-primary transition-colors cursor-pointer h-full">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  {item.listing.logoUrl ? (
                                    <img 
                                      src={getLogoUrl(item.listing.logoUrl)} 
                                      alt={item.listing.companyName}
                                      className="w-12 h-12 object-contain rounded bg-white p-0.5 border"
                                      onError={(e) => (e.currentTarget.src = "/placeholder-logo.png")}
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center text-lg font-bold">
                                      {!shouldHideBistCode(item.listing.bistCode) ? item.listing.bistCode.substring(0, 2) : "?"}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-semibold line-clamp-1" title={item.listing.companyName}>
                                      {item.listing.companyName}
                                    </div>
                                    {!shouldHideBistCode(item.listing.bistCode) && (
                                      <div className="text-xs text-muted-foreground">{item.listing.bistCode}</div>
                                    )}
                                  </div>
                                </div>
                                {renderStatusBadge(item.listing.status)}
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                {shouldShowDate(item.listing.status) && (
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Tarih</span>
                                    <span className="font-medium">{item.listing.ipoDate}</span>
                                  </div>
                                )}
                                {item.detail?.ipoPrice && (
                                  <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Fiyat</span>
                                    <span className="font-medium">{item.detail.ipoPrice}</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 flex justify-end">
                                <Button
                                  variant={followedIPOs.includes(item.listing.id) ? "default" : "outline"}
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    toggleFollow(item.listing.id, e)
                                  }}
                                  className="w-full sm:w-auto"
                                >
                                  <Bell className="mr-2 h-3.5 w-3.5" />
                                  {followedIPOs.includes(item.listing.id) ? "Takipte" : "Takip Et"}
                                </Button>
                              </div>
                            </Card>
                          </Link>
                        )
                      })}
                    </div>
                  )}

                  {/* Mobile List View Fallback */}
                  {viewMode === "list" && (
                     <div className="md:hidden space-y-4">
                        {listings.map((item, i) => {
                          const href = getListingHref(item.listing.bistCode)
                          return (
                            <Link key={`${item.listing.id}-${i}-mobile`} href={href}>
                              <Card className="p-4 cursor-pointer">
                                <div className="flex items-center gap-3 mb-3">
                                  {item.listing.logoUrl ? (
                                    <img src={getLogoUrl(item.listing.logoUrl)} className="w-10 h-10 object-contain bg-white rounded border" />
                                  ) : (
                                    <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center font-bold px-1">
                                      {!shouldHideBistCode(item.listing.bistCode) ? item.listing.bistCode.substring(0,2) : "?"}
                                    </div>
                                  )}
                                  
                                  <div className="flex-1">
                                    <div className="font-semibold">{item.listing.companyName}</div>
                                    {!shouldHideBistCode(item.listing.bistCode) && (
                                      <div className="text-xs text-muted-foreground">{item.listing.bistCode}</div>
                                    )}
                                  </div>
                                  
                                  {renderStatusBadge(item.listing.status)}
                                </div>
                                <div className="flex justify-between text-sm">
                                  {shouldShowDate(item.listing.status) && (
                                    <span className="text-muted-foreground">{item.listing.ipoDate}</span>
                                  )}
                                  {!shouldShowDate(item.listing.status) && <span className="text-muted-foreground">-</span>}
                                  {item.detail?.ipoPrice && <span className="font-medium">{item.detail.ipoPrice}</span>}
                                </div>
                              </Card>
                            </Link>
                          )
                        })}
                    </div>
                  )}
                  </>
                )}
                
                {/* Sentinel for infinite scroll */}
                {listings.length > 0 && hasMore && (
                  <div ref={observerTarget} className="flex justify-center py-6">
                     {loading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
                  </div>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  )
}
