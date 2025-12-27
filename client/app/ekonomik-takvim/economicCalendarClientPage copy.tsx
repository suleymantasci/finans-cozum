"use client"

import { Card } from "@/components/ui/card"
import { Calendar, LayoutGrid, List, Loader2, Search, Info, Bell } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState, useEffect, useMemo } from "react"
import { economicCalendarApi, EconomicEvent, CalendarPeriod } from "@/lib/economic-calendar-api"
import { toast } from "sonner"

// Extend the API interface for UI-specific fields if needed, 
// or mapped fields. For now we will derive UI props from the API data.
interface EnhancedEconomicEvent extends EconomicEvent {
  impact: 'low' | 'medium' | 'high';
  countryFlag: string;
  affects: string[];
  category: string;
  isFollowing?: boolean;
}

export default function EconomicCalendarClientPage() {
  const [activeTab, setActiveTab] = useState<CalendarPeriod>('today')
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
      
      // Transform API events to EnhancedEconomicEvent for UI
      const enhancedEvents: EnhancedEconomicEvent[] = response.events.map(event => ({
        ...event,
        impact: mapImportanceToImpact(event.importance),
        countryFlag: getCountryFlag(event.country),
        affects: ["USD", "EUR", "TRY"], // Placeholder/Mock logic as API doesn't provide this yet
        category: "Ekonomi", // Placeholder/Mock logic
        isFollowing: false,
      }))

      setEvents(enhancedEvents)
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Helper to map numeric importance to string impact
  const mapImportanceToImpact = (importance: number): 'low' | 'medium' | 'high' => {
    switch (importance) {
      case 3: return 'high';
      case 2: return 'medium';
      default: return 'low';
    }
  }

  // Helper to get country flag (mock implementation)
  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'USD': '🇺🇸',
      'EUR': '🇪🇺',
      'TRY': '🇹🇷',
      'GBP': '🇬🇧',
      'JPY': '🇯🇵',
      'CNY': '🇨🇳',
    }
    return flags[countryCode] || '🏳️';
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
              <div className="py-12 text-center">
                <p className="text-(--color-foreground-muted)">
                  {searchTerm || selectedImportance !== null ? 'Arama sonucu bulunamadı' : 'Bu dönem için etkinlik bulunamadı'}
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event, index) => (
                <Card key={`${event.date}-${index}`} className="overflow-hidden transition-shadow hover:shadow-md">
                  <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-[80px_1fr_auto] md:items-center">
                    {/* Time & Country */}
                    <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-1">
                      <div className="text-xl font-bold text-primary">{formatTime(event.date)}</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl">{event.countryFlag}</span>
                        <span className="text-xs text-muted-foreground">{event.country}</span>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Impact Badge */}
                        <span
                          className={`inline-flex h-2 w-2 rounded-full ${
                            event.impact === "high"
                              ? "bg-red-500"
                              : event.impact === "medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                        />

                        {/* Category Badge */}
                        <Badge variant="secondary" className="text-xs">
                          {event.category}
                        </Badge>

                        {/* Event Name */}
                        <h3 className="text-sm font-semibold">{event.title}</h3>

                        {/* Info Popover */}
                         {event.description && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Info className="h-3.5 w-3.5" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="start">
                              <div className="space-y-3">
                                <div>
                                  <h4 className="mb-1 text-sm font-semibold">Bu veri neyi etkiler?</h4>
                                  <p className="text-sm text-muted-foreground">{event.description}</p>
                                </div>
                                <div>
                                  <h4 className="mb-2 text-sm font-semibold">Etkilediği Piyasalar</h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {event.affects.map((affect) => (
                                      <Badge key={affect} variant="outline" className="text-xs">
                                        {affect}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>

                      {/* Data Values */}
                      <div className="flex flex-wrap gap-3 text-xs">
                        {event.actual && (
                          <div>
                            <span className="text-muted-foreground">Gerçekleşen: </span>
                            <span className="font-semibold text-primary">{event.actual}</span>
                          </div>
                        )}
                        {event.forecast && (
                          <div>
                            <span className="text-muted-foreground">Beklenti: </span>
                            <span className="font-medium">{event.forecast}</span>
                          </div>
                        )}
                        {event.previous && (
                          <div>
                            <span className="text-muted-foreground">Önceki: </span>
                            <span className="font-medium">{event.previous}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Follow Button */}
                    <div>
                      <Button variant={event.isFollowing ? "default" : "outline"} size="sm" className="gap-1.5">
                        <Bell className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{event.isFollowing ? "Takipte" : "Takip Et"}</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
