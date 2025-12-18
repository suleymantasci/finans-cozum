"use client"

import { useState } from "react"
import { Calendar, Bell, Info, Filter, Flag, Tag, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface EconomicEvent {
  id: string
  time: string
  country: string
  countryFlag: string
  impact: "low" | "medium" | "high"
  category: string
  event: string
  actual?: string
  forecast?: string
  previous?: string
  description: string
  affects: string[]
  isFollowing?: boolean
}

const economicEvents: EconomicEvent[] = [
  {
    id: "1",
    time: "11:00",
    country: "Türkiye",
    countryFlag: "🇹🇷",
    impact: "high",
    category: "Faiz Kararı",
    event: "TCMB Faiz Kararı",
    forecast: "50.00%",
    previous: "50.00%",
    description:
      "Türkiye Cumhuriyet Merkez Bankası'nın para politikası kurulu toplantısı sonrası politika faizi açıklaması.",
    affects: ["USDTRY", "BIST 100", "Tahvil Faizleri"],
    isFollowing: true,
  },
  {
    id: "2",
    time: "14:30",
    country: "Türkiye",
    countryFlag: "🇹🇷",
    impact: "medium",
    category: "İstihdam",
    event: "İşsizlik Oranı",
    actual: "9.2%",
    forecast: "9.4%",
    previous: "9.4%",
    description: "TÜİK tarafından açıklanan aylık işsizlik oranı verileri.",
    affects: ["TL", "BIST 100"],
  },
  {
    id: "3",
    time: "16:30",
    country: "ABD",
    countryFlag: "🇺🇸",
    impact: "high",
    category: "İstihdam",
    event: "İşsizlik Maaşı Başvuruları",
    forecast: "210K",
    previous: "205K",
    description: "Haftalık işsizlik maaşı başvuru sayıları. İşgücü piyasasının sağlığını gösterir.",
    affects: ["USD", "Altın", "S&P 500"],
  },
  {
    id: "4",
    time: "17:00",
    country: "Avrupa Birliği",
    countryFlag: "🇪🇺",
    impact: "high",
    category: "Faiz Kararı",
    event: "ECB Faiz Kararı",
    forecast: "4.00%",
    previous: "4.00%",
    description: "Avrupa Merkez Bankası'nın para politikası faiz kararı açıklaması.",
    affects: ["EUR", "DAX", "Tahviller"],
  },
  {
    id: "5",
    time: "11:30",
    country: "Türkiye",
    countryFlag: "🇹🇷",
    impact: "low",
    category: "Ekonomik Faaliyet",
    event: "Turizm Gelirleri",
    previous: "5.2B",
    description: "Aylık turizm geliri verileri.",
    affects: ["Turizm Hisseleri"],
  },
  {
    id: "6",
    time: "18:00",
    country: "ABD",
    countryFlag: "🇺🇸",
    impact: "medium",
    category: "Tüketici",
    event: "Tüketici Güven Endeksi",
    forecast: "102.5",
    previous: "102.0",
    description: "Conference Board tarafından açıklanan aylık tüketici güven endeksi.",
    affects: ["USD", "Perakende Hisseleri"],
  },
  {
    id: "7",
    time: "10:00",
    country: "Türkiye",
    countryFlag: "🇹🇷",
    impact: "high",
    category: "Enflasyon",
    event: "Tüketici Fiyat Endeksi (TÜFE)",
    forecast: "3.5%",
    previous: "3.2%",
    description: "TÜİK tarafından açıklanan aylık enflasyon verileri.",
    affects: ["TL", "BIST 100", "Tahviller"],
  },
  {
    id: "8",
    time: "15:00",
    country: "ABD",
    countryFlag: "🇺🇸",
    impact: "medium",
    category: "Konut",
    event: "Konut Satışları",
    forecast: "650K",
    previous: "640K",
    description: "Aylık yeni konut satış rakamları.",
    affects: ["USD", "İnşaat Hisseleri"],
  },
]

type DateFilter = "yesterday" | "today" | "tomorrow" | "custom"

export default function EkonomiTakvimiPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>("today")
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const getDateLabel = () => {
    if (dateFilter === "custom" && startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
      const end = new Date(endDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
      return `${start} - ${end}`
    }
    return "Tarih Seç"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-primary/5 via-transparent to-accent/5 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Calendar className="h-4 w-4" />
              Canlı Ekonomik Veriler
            </div>
            <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">Ekonomi Takvimi</h1>
            <p className="text-pretty text-lg text-muted-foreground">
              Türkiye ve dünya ekonomilerinin önemli veri açıklamalarını takip edin. Tüm saatler Türkiye saatine
              göredir.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="border-b bg-background py-6">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            <Button
              variant={dateFilter === "yesterday" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateFilter("yesterday")}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Dün
            </Button>
            <Button
              variant={dateFilter === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateFilter("today")}
            >
              Bugün
            </Button>
            <Button
              variant={dateFilter === "tomorrow" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateFilter("tomorrow")}
              className="gap-1"
            >
              Yarın
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-border" />

            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={dateFilter === "custom" ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    if (dateFilter !== "custom") {
                      setDateFilter("custom")
                    }
                  }}
                >
                  <Calendar className="h-4 w-4" />
                  {getDateLabel()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="center">
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">Tarih Aralığı Seçin</h4>
                    <p className="mb-3 text-xs text-muted-foreground">
                      Başlangıç ve bitiş tarihlerini seçerek özel bir aralık belirleyin.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium">Başlangıç Tarihi</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium">Bitiş Tarihi</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      if (startDate && endDate) {
                        setDateFilter("custom")
                        setIsDatePickerOpen(false)
                      }
                    }}
                    disabled={!startDate || !endDate}
                    className="w-full"
                    size="sm"
                  >
                    Uygula
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Country Filter */}
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Ülke Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Ülkeler</SelectItem>
                  <SelectItem value="tr">🇹🇷 Türkiye</SelectItem>
                  <SelectItem value="us">🇺🇸 ABD</SelectItem>
                  <SelectItem value="eu">🇪🇺 Avrupa Birliği</SelectItem>
                  <SelectItem value="uk">🇬🇧 İngiltere</SelectItem>
                  <SelectItem value="jp">🇯🇵 Japonya</SelectItem>
                  <SelectItem value="cn">🇨🇳 Çin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Kategori Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  <SelectItem value="faiz">Faiz Kararı</SelectItem>
                  <SelectItem value="enflasyon">Enflasyon</SelectItem>
                  <SelectItem value="istihdam">İstihdam</SelectItem>
                  <SelectItem value="tuketici">Tüketici</SelectItem>
                  <SelectItem value="konut">Konut</SelectItem>
                  <SelectItem value="ekonomik">Ekonomik Faaliyet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Impact Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Etki Seviyesi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Etkiler</SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Yüksek Etki
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                      Orta Etki
                    </span>
                  </SelectItem>
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Düşük Etki
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto">
              <Badge variant="outline" className="text-xs">
                Türkiye Saati (GMT+3)
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl space-y-2">
            {economicEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-[80px_1fr_auto] md:items-center">
                  {/* Time & Country */}
                  <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-1">
                    <div className="text-xl font-bold text-primary">{event.time}</div>
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
                      <h3 className="text-sm font-semibold">{event.event}</h3>

                      {/* Info Popover */}
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
        </div>
      </section>

      {/* Info Section */}
      <section className="border-t bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">Ekonomi Takvimi Nasıl Kullanılır?</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                </div>
                <h3 className="mb-2 font-semibold">Yüksek Etki</h3>
                <p className="text-sm text-muted-foreground">
                  Piyasaları önemli ölçüde etkileyebilecek veriler. İşlem yapmadan önce mutlaka takip edin.
                </p>
              </Card>
              <Card className="p-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                </div>
                <h3 className="mb-2 font-semibold">Orta Etki</h3>
                <p className="text-sm text-muted-foreground">
                  Belirli sektörleri etkileyebilecek veriler. İlgili piyasalarda işlem yapıyorsanız dikkat edin.
                </p>
              </Card>
              <Card className="p-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                </div>
                <h3 className="mb-2 font-semibold">Düşük Etki</h3>
                <p className="text-sm text-muted-foreground">
                  Genellikle sınırlı etki yaratan veriler. Bilgi amaçlı takip edilebilir.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
