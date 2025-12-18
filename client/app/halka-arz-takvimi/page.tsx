"use client"

import { useState } from "react"
import { Calendar, TrendingUp, ChevronLeft, ChevronRight, Flag, Building2, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface IPOEvent {
  id: string
  company: string
  ticker: string
  exchange: string
  ipoDate: string
  ipoValue: string
  ipoPrice: string
  currentPrice?: string
  sector: string
  country: string
  countryFlag: string
  status: "upcoming" | "completed"
  isFollowing?: boolean
}

interface DraftIPO {
  id: string
  company: string
  ticker: string
  exchange: string
  sector: string
  country: string
  countryFlag: string
}

const ipoEvents: IPOEvent[] = [
  {
    id: "1",
    company: "Teknoloji A.Ş.",
    ticker: "TEKNO",
    exchange: "Borsa Istanbul",
    ipoDate: "2025-02-15",
    ipoValue: "500M TRY",
    ipoPrice: "25.00 - 30.00 TRY",
    sector: "Teknoloji",
    country: "Türkiye",
    countryFlag: "🇹🇷",
    status: "upcoming",
    isFollowing: true,
  },
  {
    id: "2",
    company: "Enerji Holding",
    ticker: "ENRJI",
    exchange: "Borsa Istanbul",
    ipoDate: "2025-02-20",
    ipoValue: "750M TRY",
    ipoPrice: "40.00 - 45.00 TRY",
    sector: "Enerji",
    country: "Türkiye",
    countryFlag: "🇹🇷",
    status: "upcoming",
    isFollowing: false,
  },
  {
    id: "3",
    company: "AI Solutions Corp",
    ticker: "AISOL",
    exchange: "NASDAQ",
    ipoDate: "2025-01-10",
    ipoValue: "200M USD",
    ipoPrice: "18.00 USD",
    currentPrice: "24.50 USD",
    sector: "Teknoloji",
    country: "ABD",
    countryFlag: "🇺🇸",
    status: "completed",
    isFollowing: false,
  },
  {
    id: "4",
    company: "Green Energy GmbH",
    ticker: "GREN",
    exchange: "Frankfurt Stock Exchange",
    ipoDate: "2025-01-15",
    ipoValue: "150M EUR",
    ipoPrice: "22.00 EUR",
    currentPrice: "20.80 EUR",
    sector: "Enerji",
    country: "Almanya",
    countryFlag: "🇩🇪",
    status: "completed",
    isFollowing: false,
  },
  {
    id: "5",
    company: "Fintech Innovations",
    ticker: "FINOV",
    exchange: "NASDAQ",
    ipoDate: "2025-02-25",
    ipoValue: "300M USD",
    ipoPrice: "15.00 - 18.00 USD",
    sector: "Finans",
    country: "ABD",
    countryFlag: "🇺🇸",
    status: "upcoming",
    isFollowing: false,
  },
  {
    id: "6",
    company: "Sağlık Teknolojileri A.Ş.",
    ticker: "SAGTEK",
    exchange: "Borsa Istanbul",
    ipoDate: "2025-03-01",
    ipoValue: "400M TRY",
    ipoPrice: "30.00 - 35.00 TRY",
    sector: "Sağlık",
    country: "Türkiye",
    countryFlag: "🇹🇷",
    status: "upcoming",
    isFollowing: false,
  },
]

const draftIPOs: DraftIPO[] = [
  {
    id: "d1",
    company: "Yapay Zeka Teknolojileri A.Ş.",
    ticker: "YZTK",
    exchange: "Borsa Istanbul",
    sector: "Teknoloji",
    country: "Türkiye",
    countryFlag: "🇹🇷",
  },
  {
    id: "d2",
    company: "Blockchain Innovations",
    ticker: "BLCK",
    exchange: "NASDAQ",
    sector: "Finans",
    country: "ABD",
    countryFlag: "🇺🇸",
  },
  {
    id: "d3",
    company: "Yenilenebilir Enerji A.Ş.",
    ticker: "YENER",
    exchange: "Borsa Istanbul",
    sector: "Enerji",
    country: "Türkiye",
    countryFlag: "🇹🇷",
  },
  {
    id: "d4",
    company: "BioTech Solutions GmbH",
    ticker: "BIOT",
    exchange: "Frankfurt Stock Exchange",
    sector: "Sağlık",
    country: "Almanya",
    countryFlag: "🇩🇪",
  },
  {
    id: "d5",
    company: "E-Commerce Global",
    ticker: "ECOM",
    exchange: "NYSE",
    sector: "Perakende",
    country: "ABD",
    countryFlag: "🇺🇸",
  },
]

type DateFilter = "yesterday" | "today" | "tomorrow" | "custom"

export default function HalkaArzTakvimiPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>("today")
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "completed">("all")
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [followedIPOs, setFollowedIPOs] = useState<string[]>(ipoEvents.filter((e) => e.isFollowing).map((e) => e.id))

  const toggleFollow = (id: string) => {
    setFollowedIPOs((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]))
  }

  const getDateLabel = () => {
    if (dateFilter === "custom" && startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
      const end = new Date(endDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
      return `${start} - ${end}`
    }
    return "Tarih Seç"
  }

  const filteredEvents = ipoEvents.filter((event) => {
    if (statusFilter === "all") return true
    return event.status === statusFilter
  })

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
              Türkiye ve dünya borsalarındaki yaklaşan ve gerçekleşen halka arzları takip edin. İlk fiyat bilgileri ve
              son durumları inceleyin.
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
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="upcoming">Yaklaşan</SelectItem>
                  <SelectItem value="completed">Gerçekleşen</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                  <SelectItem value="eu">🇪🇺 Avrupa</SelectItem>
                  <SelectItem value="uk">🇬🇧 İngiltere</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Exchange Filter */}
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="all">
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Borsa Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Borsalar</SelectItem>
                  <SelectItem value="bist">Borsa Istanbul</SelectItem>
                  <SelectItem value="nasdaq">NASDAQ</SelectItem>
                  <SelectItem value="nyse">NYSE</SelectItem>
                  <SelectItem value="frankfurt">Frankfurt Stock Exchange</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* IPO Table */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="mb-6 w-full justify-start">
                <TabsTrigger value="active">Mevcut Arzlar</TabsTrigger>
                <TabsTrigger value="drafts">Taslaklar</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-0">
                {/* Desktop Table */}
                <div className="hidden overflow-x-auto rounded-lg border md:block">
                  <table className="w-full">
                    <thead className="bg-secondary/30">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Şirket</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Borsa</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Halka Arz Tarihi</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Halka Arz Değeri</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Halka Arz Fiyatı</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Son Fiyat</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Durum</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Takip</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{event.countryFlag}</span>
                              <div>
                                <div className="font-semibold">{event.company}</div>
                                <div className="text-xs text-muted-foreground">{event.ticker}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{event.exchange}</td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(event.ipoDate).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="font-semibold text-primary">{event.ipoValue}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{event.ipoPrice}</td>
                          <td className="px-4 py-3 text-right">
                            {event.currentPrice ? (
                              <div className="font-semibold text-green-600 dark:text-green-400">
                                {event.currentPrice}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={event.status === "upcoming" ? "default" : "secondary"}
                              className="mx-auto block w-fit"
                            >
                              {event.status === "upcoming" ? "Yaklaşan" : "Gerçekleşti"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant={followedIPOs.includes(event.id) ? "default" : "outline"}
                              size="sm"
                              className="mx-auto block gap-1.5"
                              onClick={() => toggleFollow(event.id)}
                            >
                              <Bell className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-3 md:hidden">
                  {filteredEvents.map((event) => (
                    <Card key={event.id} className="p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{event.countryFlag}</span>
                          <div>
                            <div className="font-semibold">{event.company}</div>
                            <div className="text-xs text-muted-foreground">{event.ticker}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={event.status === "upcoming" ? "default" : "secondary"}>
                            {event.status === "upcoming" ? "Yaklaşan" : "Gerçekleşti"}
                          </Badge>
                          <Button
                            variant={followedIPOs.includes(event.id) ? "default" : "outline"}
                            size="sm"
                            className="gap-1.5"
                            onClick={() => toggleFollow(event.id)}
                          >
                            <Bell className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Borsa:</span>
                          <span className="font-medium">{event.exchange}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tarih:</span>
                          <span className="font-medium">
                            {new Date(event.ipoDate).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Halka Arz Değeri:</span>
                          <span className="font-semibold text-primary">{event.ipoValue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Halka Arz Fiyatı:</span>
                          <span className="font-medium">{event.ipoPrice}</span>
                        </div>
                        {event.currentPrice && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Son Fiyat:</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {event.currentPrice}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sektör:</span>
                          <span className="text-xs">{event.sector}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Drafts Tab Content */}
              <TabsContent value="drafts" className="mt-0">
                {/* Desktop Table */}
                <div className="hidden overflow-x-auto rounded-lg border md:block">
                  <table className="w-full">
                    <thead className="bg-secondary/30">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Şirket</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Borsa</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Sektör</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {draftIPOs.map((draft) => (
                        <tr key={draft.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{draft.countryFlag}</span>
                              <div>
                                <div className="font-semibold">{draft.company}</div>
                                <div className="text-xs text-muted-foreground">{draft.ticker}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{draft.exchange}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{draft.sector}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="space-y-3 md:hidden">
                  {draftIPOs.map((draft) => (
                    <Card key={draft.id} className="p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="text-2xl">{draft.countryFlag}</span>
                        <div>
                          <div className="font-semibold">{draft.company}</div>
                          <div className="text-xs text-muted-foreground">{draft.ticker}</div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Borsa:</span>
                          <span className="font-medium">{draft.exchange}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sektör:</span>
                          <span className="text-muted-foreground">{draft.sector}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="border-t bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">Halka Arz Nedir?</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-2 font-semibold">İlk Halka Arz (IPO)</h3>
                <p className="text-sm text-muted-foreground">
                  Bir şirketin hisselerini ilk kez halka satışa sunması. Yatırımcılar bu sayede şirketin ortağı
                  olabilir.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="mb-2 font-semibold">Halka Arz Fiyatı</h3>
                <p className="text-sm text-muted-foreground">
                  Hisselerin halka satılacağı fiyat veya fiyat aralığı. Genellikle bir aralık olarak belirlenir ve son
                  gün netleşir.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="mb-2 font-semibold">Halka Arz Değeri</h3>
                <p className="text-sm text-muted-foreground">
                  Şirketin halka arz edilecek hisselerinin toplam değeri. Bu rakam, şirketin büyüklüğü hakkında fikir
                  verir.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="mb-2 font-semibold">İlk İşlem Günü</h3>
                <p className="text-sm text-muted-foreground">
                  Hisselerin borsada işlem görmeye başladığı gün. İlk gün fiyat genellikle halka arz fiyatından farklı
                  olabilir.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
