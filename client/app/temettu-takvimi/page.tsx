"use client"

import { useState } from "react"
import { Calendar, TrendingUp, ChevronLeft, ChevronRight, Flag, Tag, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DividendEvent {
  id: string
  company: string
  ticker: string
  exDividendDate: string
  paymentDate: string
  amount: string
  currency: string
  yield: string
  type: string
  country: string
  countryFlag: string
  sector: string
  isFollowing?: boolean
}

const dividendEvents: DividendEvent[] = [
  {
    id: "1",
    company: "Türk Telekom",
    ticker: "TTKOM",
    exDividendDate: "2025-01-15",
    paymentDate: "2025-02-01",
    amount: "2.50",
    currency: "TRY",
    yield: "4.2%",
    type: "Yıllık",
    country: "Türkiye",
    countryFlag: "🇹🇷",
    sector: "Telekomünikasyon",
    isFollowing: false,
  },
  {
    id: "2",
    company: "Akbank",
    ticker: "AKBNK",
    exDividendDate: "2025-01-18",
    paymentDate: "2025-02-05",
    amount: "3.80",
    currency: "TRY",
    yield: "5.1%",
    type: "Yıllık",
    country: "Türkiye",
    countryFlag: "🇹🇷",
    sector: "Bankacılık",
    isFollowing: true,
  },
  {
    id: "3",
    company: "Apple Inc.",
    ticker: "AAPL",
    exDividendDate: "2025-01-20",
    paymentDate: "2025-02-10",
    amount: "0.25",
    currency: "USD",
    yield: "0.5%",
    type: "Üç Aylık",
    country: "ABD",
    countryFlag: "🇺🇸",
    sector: "Teknoloji",
    isFollowing: false,
  },
  {
    id: "4",
    company: "Coca-Cola",
    ticker: "KO",
    exDividendDate: "2025-01-22",
    paymentDate: "2025-02-15",
    amount: "0.48",
    currency: "USD",
    yield: "3.2%",
    type: "Üç Aylık",
    country: "ABD",
    countryFlag: "🇺🇸",
    sector: "Tüketim",
    isFollowing: false,
  },
  {
    id: "5",
    company: "Ereğli Demir Çelik",
    ticker: "EREGL",
    exDividendDate: "2025-01-25",
    paymentDate: "2025-02-20",
    amount: "1.20",
    currency: "TRY",
    yield: "3.8%",
    type: "Yıllık",
    country: "Türkiye",
    countryFlag: "🇹🇷",
    sector: "Metal ve Madencilik",
    isFollowing: false,
  },
  {
    id: "6",
    company: "Siemens AG",
    ticker: "SIE",
    exDividendDate: "2025-01-28",
    paymentDate: "2025-02-25",
    amount: "4.70",
    currency: "EUR",
    yield: "2.8%",
    type: "Yıllık",
    country: "Almanya",
    countryFlag: "🇩🇪",
    sector: "Sanayi",
    isFollowing: false,
  },
]

type DateFilter = "yesterday" | "today" | "tomorrow" | "custom"

export default function TemettüTakvimiPage() {
  const [dateFilter, setDateFilter] = useState<DateFilter>("today")
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [followedDividends, setFollowedDividends] = useState<string[]>(
    dividendEvents.filter((e) => e.isFollowing).map((e) => e.id),
  )

  const toggleFollow = (id: string) => {
    setFollowedDividends((prev) => (prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]))
  }

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
              <TrendingUp className="h-4 w-4" />
              Temettü Takibi
            </div>
            <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">Temettü Takvimi</h1>
            <p className="text-pretty text-lg text-muted-foreground">
              Türkiye ve dünya borsalarındaki şirketlerin temettü dağıtım tarihlerini ve tutarlarını takip edin.
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
                  <SelectItem value="eu">🇪🇺 Avrupa</SelectItem>
                  <SelectItem value="uk">🇬🇧 İngiltere</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sector Filter */}
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sektör Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Sektörler</SelectItem>
                  <SelectItem value="banking">Bankacılık</SelectItem>
                  <SelectItem value="tech">Teknoloji</SelectItem>
                  <SelectItem value="telecom">Telekomünikasyon</SelectItem>
                  <SelectItem value="industry">Sanayi</SelectItem>
                  <SelectItem value="consumer">Tüketim</SelectItem>
                  <SelectItem value="metal">Metal ve Madencilik</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Temettü Çeşidi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="monthly">Aylık</SelectItem>
                  <SelectItem value="quarterly">Üç Aylık</SelectItem>
                  <SelectItem value="semi">Altı Aylık</SelectItem>
                  <SelectItem value="annual">Yıllık</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Dividends Table */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto rounded-lg border md:block">
              <table className="w-full">
                <thead className="bg-secondary/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Şirket</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Temettüsüz İşlem Tarihi</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Ödeme Tarihi</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Temettü</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Getiri</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Çeşit</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Sektör</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Takip</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dividendEvents.map((event) => (
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
                      <td className="px-4 py-3 text-sm">
                        {new Date(event.exDividendDate).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(event.paymentDate).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold text-primary">
                          {event.amount} {event.currency}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="secondary" className="font-semibold">
                          {event.yield}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="mx-auto block w-fit text-xs">
                          {event.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground">{event.sector}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant={followedDividends.includes(event.id) ? "default" : "outline"}
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
              {dividendEvents.map((event) => (
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
                      <Badge variant="secondary" className="font-semibold">
                        {event.yield}
                      </Badge>
                      <Button
                        variant={followedDividends.includes(event.id) ? "default" : "outline"}
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
                      <span className="text-muted-foreground">Temettüsüz Tarih:</span>
                      <span className="font-medium">
                        {new Date(event.exDividendDate).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ödeme Tarihi:</span>
                      <span className="font-medium">
                        {new Date(event.paymentDate).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Temettü:</span>
                      <span className="font-semibold text-primary">
                        {event.amount} {event.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Çeşit:</span>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sektör:</span>
                      <span className="text-xs">{event.sector}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="border-t bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold">Temettü Takvimi Nasıl Kullanılır?</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-2 font-semibold">Temettüsüz İşlem Tarihi</h3>
                <p className="text-sm text-muted-foreground">
                  Bu tarihte veya sonrasında hisse satın alan yatırımcılar temettü alamazlar. Temettü almak için bu
                  tarihten önce hisse sahibi olmalısınız.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="mb-2 font-semibold">Ödeme Tarihi</h3>
                <p className="text-sm text-muted-foreground">
                  Temettünün hak sahiplerine ödeneceği tarih. Genellikle temettüsüz işlem tarihinden 2-4 hafta sonradır.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="mb-2 font-semibold">Temettü Getirisi</h3>
                <p className="text-sm text-muted-foreground">
                  Yıllık temettü tutarının hisse fiyatına oranı. Yatırımdan elde edilecek nakit getiriyi gösterir.
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="mb-2 font-semibold">Temettü Çeşitleri</h3>
                <p className="text-sm text-muted-foreground">
                  Şirketler aylık, üç aylık, altı aylık veya yıllık olarak temettü dağıtabilir. Türkiye'de genellikle
                  yıllık temettü dağıtımı yapılır.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
