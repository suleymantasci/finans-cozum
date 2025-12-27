"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, LayoutGrid, List, Loader2, Search, Info, Bell } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState, useEffect, useMemo } from "react"
import { economicCalendarApi, EconomicEvent, CalendarPeriod } from "@/lib/economic-calendar-api"
import { toast } from "sonner"

interface EnhancedEconomicEvent extends EconomicEvent {
  isFollowing?: boolean;
}


export default function EconomicCalendarClientPage() {
  const [activeTab, setActiveTab] = useState<CalendarPeriod>('today')
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [events, setEvents] = useState<EnhancedEconomicEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedImportance, setSelectedImportance] = useState<number | null>(null)

  useEffect(() => {
    loadEvents()
  }, [activeTab])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const response = await economicCalendarApi.getEvents(activeTab)
      setEvents(response.events)
    } catch (error: any) {
      console.error('Ekonomik takvim yüklenemedi:', error)
      toast.error('Ekonomik takvim yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  // Filter events by search term and importance
  const filteredEvents = useMemo(() => {
    let filtered = events

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(term) ||
        event.country.toLowerCase().includes(term)
      )
    }

    // Filter by importance
    if (selectedImportance !== null) {
      filtered = filtered.filter(event => event.importance === selectedImportance)
    }

    return filtered
  }, [events, searchTerm, selectedImportance])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getImportanceBadge = (importance: number) => {
    const variants = {
      1: { variant: "secondary" as const, label: "Düşük" },
      2: { variant: "default" as const, label: "Orta" },
      3: { variant: "destructive" as const, label: "Yüksek" },
    }
    const config = variants[importance as keyof typeof variants] || variants[1]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTabLabel = (period: CalendarPeriod) => {
    const labels = {
      yesterday: 'Dün',
      today: 'Bugün',
      tomorrow: 'Yarın',
      week: '1 Hafta',
      month: '1 Ay',
    }
    return labels[period]
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Ekonomik Takvim</h1>
        <p className="text-lg text-(--color-foreground-muted)">
          Önemli ekonomik göstergeleri ve duyuruları takip edin
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CalendarPeriod)} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="grid w-full grid-cols-5 sm:w-auto">
            <TabsTrigger value="yesterday">{getTabLabel('yesterday')}</TabsTrigger>
            <TabsTrigger value="today">{getTabLabel('today')}</TabsTrigger>
            <TabsTrigger value="tomorrow">{getTabLabel('tomorrow')}</TabsTrigger>
            <TabsTrigger value="week">{getTabLabel('week')}</TabsTrigger>
            <TabsTrigger value="month">{getTabLabel('month')}</TabsTrigger>
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

        {/* Search and filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Etkinlik veya ülke ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedImportance === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedImportance(null)}
            >
              Tümü
            </Button>
            <Button
              variant={selectedImportance === 3 ? "destructive" : "outline"}
              size="sm"
              onClick={() => setSelectedImportance(selectedImportance === 3 ? null : 3)}
            >
              Yüksek
            </Button>
            <Button
              variant={selectedImportance === 2 ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedImportance(selectedImportance === 2 ? null : 2)}
            >
              Orta
            </Button>
            <Button
              variant={selectedImportance === 1 ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSelectedImportance(selectedImportance === 1 ? null : 1)}
            >
              Düşük
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-(--color-foreground-muted)">
                  {searchTerm || selectedImportance !== null ? 'Arama sonucu bulunamadı' : 'Bu dönem için etkinlik bulunamadı'}
                </p>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="space-y-3">
              {filteredEvents.map((event, index) => (
                <Card key={`${event.date}-${index}`} className="hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Time/Date */}
                      <div className="flex flex-col items-center justify-center min-w-[80px]">
                        <span className="text-lg font-bold text-primary">
                          {formatDateTime(event.date)}
                        </span>
                      </div>

                      {/* Country and Event Title */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getImportanceBadge(event.importance)}
                          <span className="text-sm font-medium">{event.country}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">{event.title}</h3>
                          {event.description && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                  <Info className="h-3 w-3" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80">
                                <p className="text-sm">{event.description}</p>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      {/* Values */}
                      <div className="flex flex-wrap gap-3 text-xs">
                        {event.actual && (
                          <div>
                            <span className="text-muted-foreground">Gerçekleşen: </span>
                            <span className="font-semibold">{event.actual}</span>
                          </div>
                        )}
                        {event.forecast && (
                          <div>
                            <span className="text-muted-foreground">Beklenti: </span>
                            <span className="font-semibold">{event.forecast}</span>
                          </div>
                        )}
                        {event.previous && (
                          <div>
                            <span className="text-muted-foreground">Önceki: </span>
                            <span className="font-semibold">{event.previous}</span>
                          </div>
                        )}
                      </div>
                      </div>

                      {/* <div>
                        <Button variant={event.isFollowing ? "default" : "outline"} size="sm" className="gap-1.5">
                          <Bell className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{event.isFollowing ? "Takipte" : "Takip Et"}</span>
                        </Button>
                      </div> */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden py-0">
              <CardContent className="p-0">
                <div className="divide-y divide-(--color-border)">
                  {/* Table Header */}
                  <div className="hidden md:grid grid-cols-12 gap-2 p-3 bg-(--color-surface) text-xs font-semibold text-(--color-foreground-muted) sticky top-0 z-10">
                    <div className="col-span-2">Tarih</div>
                    <div className="col-span-2">Ülke</div>
                    <div className="col-span-4">Etkinlik</div>
                    <div className="col-span-1 text-center">Önem</div>
                    <div className="col-span-1 text-center">Beklenti</div>
                    <div className="col-span-1 text-center">Gerçekleşen</div>
                    <div className="col-span-1 text-center">Önceki</div>
                  </div>
                  {filteredEvents.map((event, index) => (
                    <div
                      key={`${event.date}-${index}`}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 hover:bg-(--color-surface) transition-colors text-sm"
                    >
                      <div className="md:col-span-2 font-semibold md:font-normal">
                        <span className="md:hidden text-(--color-foreground-muted)">Tarih: </span>
                        {formatDateTime(event.date)}
                      </div>
                      <div className="md:col-span-2">
                        <span className="md:hidden text-(--color-foreground-muted)">Ülke: </span>
                        {event.country}
                      </div>
                      <div className="md:col-span-4 flex items-center gap-2">
                        <span className="flex-1">{event.title}</span>
                        {event.description && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Info className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <p className="text-sm">{event.description}</p>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                      <div className="md:col-span-1 md:text-center">
                        <span className="md:hidden text-(--color-foreground-muted)">Önem: </span>
                        {getImportanceBadge(event.importance)}
                      </div>
                      <div className="md:col-span-1 md:text-center">
                        <span className="md:hidden text-(--color-foreground-muted)">Beklenti: </span>
                        {event.forecast || '-'}
                      </div>
                      <div className="md:col-span-1 md:text-center font-semibold text-(--color-success)">
                        <span className="md:hidden text-(--color-foreground-muted)">Gerçekleşen: </span>
                        {event.actual || '-'}
                      </div>
                      <div className="md:col-span-1 md:text-center">
                        <span className="md:hidden text-(--color-foreground-muted)">Önceki: </span>
                        {event.previous || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
