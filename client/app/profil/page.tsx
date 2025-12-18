"use client"

import { useState } from "react"
import { User, Bell, Bookmark, Calendar, Mail, Phone, Edit2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { RequireAuth } from "@/components/auth/require-auth"
import { useAuth } from "@/contexts/auth-context"

function ProfilPageContent() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@example.com",
    phone: "+90 532 123 45 67",
  })

  const savedNews = [
    {
      id: 1,
      title: "Merkez Bankası Faiz Kararı Açıklandı",
      category: "Ekonomi",
      date: "18 Ara 2024",
      image: "/central-bank-building.jpg",
    },
    {
      id: 2,
      title: "Dolar Kuru Yeni Rekor Kırdı",
      category: "Döviz",
      date: "17 Ara 2024",
      image: "/stock-market.jpg",
    },
    {
      id: 3,
      title: "Altın Fiyatları Yükselişte",
      category: "Emtia",
      date: "16 Ara 2024",
      image: "/gold-bars.jpg",
    },
  ]

  const followedEconomicEvents = [
    {
      id: "1",
      date: "20 Ara 2024",
      time: "11:00",
      event: "TCMB Faiz Kararı",
      country: "🇹🇷 Türkiye",
      impact: "high" as const,
    },
    {
      id: "2",
      date: "22 Ara 2024",
      time: "16:30",
      event: "İşsizlik Maaşı Başvuruları",
      country: "🇺🇸 ABD",
      impact: "high" as const,
    },
    {
      id: "3",
      date: "25 Ara 2024",
      time: "10:00",
      event: "Tüketici Fiyat Endeksi (TÜFE)",
      country: "🇹🇷 Türkiye",
      impact: "high" as const,
    },
  ]

  const followedDividends = [
    {
      id: "1",
      date: "22 Ara 2024",
      company: "Türk Hava Yolları",
      ticker: "THYAO",
      amount: "₺2.50",
      yield: "4.2%",
    },
    {
      id: "2",
      date: "28 Ara 2024",
      company: "Ereğli Demir Çelik",
      ticker: "EREGL",
      amount: "₺1.80",
      yield: "5.1%",
    },
  ]

  const followedIPOs = [
    {
      id: "1",
      date: "19 Ara 2024",
      company: "Tech Startup A.Ş.",
      sector: "Teknoloji",
      exchange: "BIST",
      priceRange: "₺15-18",
      status: "upcoming" as const,
    },
    {
      id: "2",
      date: "02 Oca 2025",
      company: "Enerji Yatırım A.Ş.",
      sector: "Enerji",
      exchange: "BIST",
      priceRange: "₺22-25",
      status: "upcoming" as const,
    },
  ]

  const favoritedMarkets = [
    {
      id: "1",
      symbol: "USD/TRY",
      name: "Amerikan Doları / Türk Lirası",
      price: 38.4825,
      change: 0.13,
    },
    {
      id: "2",
      symbol: "EUR/TRY",
      name: "Euro / Türk Lirası",
      price: 42.15,
      change: 0.25,
    },
    {
      id: "3",
      symbol: "BTC/USD",
      name: "Bitcoin / Amerikan Doları",
      price: 98245.32,
      change: -1.2,
    },
  ]

  const favoritedTools = [
    {
      id: "1",
      title: "Kredi Hesaplama",
      description: "İhtiyaç, konut ve taşıt kredisi hesaplama",
      slug: "kredi-hesaplama",
      icon: "calculator",
    },
    {
      id: "2",
      title: "Döviz Çevirici",
      description: "Anlık kurlarla döviz çevirisi",
      slug: "doviz-cevirici",
      icon: "exchange",
    },
  ]

  const handleSave = () => {
    setIsEditing(false)
    // Burada profil güncelleme API çağrısı yapılabilir
  }

  return (
    <div className="min-h-screen bg-(--color-background)">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-(--color-primary)/5 via-transparent to-(--color-accent)/5 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-(--color-primary)/10">
                <User className="h-10 w-10 text-(--color-primary)" />
              </div>
              <div className="flex-1">
                <h1 className="mb-2 text-3xl font-bold md:text-4xl">Profilim</h1>
                <p className="text-(--color-foreground-muted)">Favorilerinizi ve takip ettiklerinizi yönetin</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <Tabs defaultValue="favorites" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="favorites">
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Favoriler</span>
                </TabsTrigger>
                <TabsTrigger value="calendars">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Takvimler</span>
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Bildirimler</span>
                </TabsTrigger>
                <TabsTrigger value="profile">
                  <User className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Profil</span>
                </TabsTrigger>
              </TabsList>

              {/* Favoriler Tab */}
              <TabsContent value="favorites" className="mt-6 space-y-6">
                {/* Favori Haberler */}
                <Card>
                  <CardHeader>
                    <CardTitle>Favori Haberler</CardTitle>
                    <CardDescription>Kaydettiğiniz haberler burada görünür</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {savedNews.map((news) => (
                        <Link key={news.id} href={`/haberler/${news.id}`}>
                          <div className="group flex gap-4 rounded-lg border p-4 transition-all hover:border-(--color-primary) hover:shadow-md">
                            <img
                              src={news.image || "/placeholder.svg"}
                              alt={news.title}
                              className="h-20 w-20 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <Badge variant="secondary" className="mb-2 text-xs">
                                {news.category}
                              </Badge>
                              <h3 className="mb-1 font-semibold group-hover:text-(--color-primary)">{news.title}</h3>
                              <p className="text-sm text-(--color-foreground-muted)">{news.date}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="shrink-0">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Favori Piyasalar */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Favori Piyasalar</CardTitle>
                        <CardDescription>Takip ettiğiniz döviz, kripto ve hisse senetleri</CardDescription>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/piyasalar">Piyasalara Git</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {favoritedMarkets.map((market) => (
                        <Link key={market.id} href={`/piyasalar/${market.symbol.toLowerCase().replace(/\//g, "-")}`}>
                          <div className="group flex items-center justify-between rounded-lg border p-4 transition-all hover:border-(--color-primary) hover:shadow-md">
                            <div className="flex-1">
                              <h3 className="mb-1 font-semibold group-hover:text-(--color-primary)">{market.symbol}</h3>
                              <p className="text-sm text-(--color-foreground-muted)">{market.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="mb-1 font-semibold">
                                {market.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                              </p>
                              <p
                                className={`text-sm font-medium ${
                                  market.change > 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {market.change > 0 ? "+" : ""}
                                {market.change}%
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" className="ml-4 shrink-0">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Favori Araçlar */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Favori Araçlar</CardTitle>
                        <CardDescription>Sık kullandığınız hesaplama araçları</CardDescription>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/araclar">Tüm Araçlar</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {favoritedTools.map((tool) => (
                        <Link key={tool.id} href={`/araclar/${tool.slug}`}>
                          <div className="group flex items-start gap-4 rounded-lg border p-4 transition-all hover:border-(--color-primary) hover:shadow-md">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--color-primary)/10">
                              {tool.icon === "calculator" ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6 text-(--color-primary)"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6 text-(--color-primary)"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                  />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="mb-1 font-semibold group-hover:text-(--color-primary)">{tool.title}</h3>
                              <p className="text-sm text-(--color-foreground-muted)">{tool.description}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="shrink-0">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Takvimler Tab */}
              <TabsContent value="calendars" className="mt-6 space-y-6">
                {/* Ekonomi Takvimi */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Ekonomi Takvimi</CardTitle>
                        <CardDescription>Takip ettiğiniz ekonomik veriler</CardDescription>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/ekonomi-takvimi">Tümünü Gör</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {followedEconomicEvents.map((event) => (
                        <div key={event.id} className="flex items-center gap-4 rounded-lg border p-3">
                          <div className="text-center">
                            <p className="text-sm font-semibold text-(--color-primary)">{event.time}</p>
                            <p className="text-xs text-(--color-foreground-muted)">{event.date}</p>
                          </div>
                          <div className="h-8 w-px bg-(--color-border)" />
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span
                                className={`inline-flex h-2 w-2 rounded-full ${
                                  event.impact === "high" ? "bg-red-500" : "bg-yellow-500"
                                }`}
                              />
                              <h4 className="font-semibold text-sm">{event.event}</h4>
                            </div>
                            <p className="text-xs text-(--color-foreground-muted)">{event.country}</p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Bell className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Temettü Takvimi */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Temettü Takvimi</CardTitle>
                        <CardDescription>Takip ettiğiniz temettü ödemeleri</CardDescription>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/temettu-takvimi">Tümünü Gör</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {followedDividends.map((dividend) => (
                        <div key={dividend.id} className="flex items-center gap-4 rounded-lg border p-3">
                          <div className="text-center">
                            <p className="text-xs text-(--color-foreground-muted)">{dividend.date}</p>
                          </div>
                          <div className="h-8 w-px bg-(--color-border)" />
                          <div className="flex-1">
                            <h4 className="mb-1 font-semibold text-sm">{dividend.company}</h4>
                            <p className="text-xs text-(--color-foreground-muted)">{dividend.ticker}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">{dividend.amount}</p>
                            <p className="text-xs text-green-600">{dividend.yield}</p>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Bell className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Halka Arz Takvimi */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Halka Arz Takvimi</CardTitle>
                        <CardDescription>Takip ettiğiniz halka arzlar</CardDescription>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/halka-arz-takvimi">Tümünü Gör</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {followedIPOs.map((ipo) => (
                        <div key={ipo.id} className="flex items-center gap-4 rounded-lg border p-3">
                          <div className="text-center">
                            <p className="text-xs text-(--color-foreground-muted)">{ipo.date}</p>
                          </div>
                          <div className="h-8 w-px bg-(--color-border)" />
                          <div className="flex-1">
                            <h4 className="mb-1 font-semibold text-sm">{ipo.company}</h4>
                            <p className="text-xs text-(--color-foreground-muted)">
                              {ipo.sector} • {ipo.exchange}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">{ipo.priceRange}</p>
                            <Badge variant="outline" className="text-xs">
                              Yaklaşan
                            </Badge>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Bell className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bildirimler Tab */}
              <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bildirim Ayarları</CardTitle>
                    <CardDescription>Hangi bildirimleri almak istediğinizi seçin</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">Ekonomi Takvimi Bildirimleri</p>
                        <p className="text-sm text-(--color-foreground-muted)">
                          Takip ettiğiniz ekonomik veriler için bildirim alın
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Aktif
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">Temettü Bildirimleri</p>
                        <p className="text-sm text-(--color-foreground-muted)">
                          Takip ettiğiniz şirketlerin temettü ödemeleri için bildirim alın
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Aktif
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">Halka Arz Bildirimleri</p>
                        <p className="text-sm text-(--color-foreground-muted)">
                          Takip ettiğiniz halka arzlar için bildirim alın
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Aktif
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">Haber Bildirimleri</p>
                        <p className="text-sm text-(--color-foreground-muted)">Önemli haberler için bildirim alın</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Kapalı
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profil Tab */}
              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Profil Bilgileri</CardTitle>
                        <CardDescription>Hesap bilgilerinizi görüntüleyin ve düzenleyin</CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Düzenle
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                            <X className="mr-2 h-4 w-4" />
                            İptal
                          </Button>
                          <Button size="sm" onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" />
                            Kaydet
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ad Soyad</Label>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-(--color-foreground-muted)" />
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-(--color-foreground-muted)" />
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-(--color-foreground-muted)" />
                        <Input
                          id="phone"
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <h3 className="mb-4 font-semibold">Hesap İstatistikleri</h3>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border bg-(--color-muted) p-4 text-center">
                          <p className="text-2xl font-bold text-(--color-primary)">{savedNews.length}</p>
                          <p className="text-sm text-(--color-foreground-muted)">Favori Haber</p>
                        </div>
                        <div className="rounded-lg border bg-(--color-muted) p-4 text-center">
                          <p className="text-2xl font-bold text-(--color-primary)">
                            {favoritedMarkets.length + favoritedTools.length}
                          </p>
                          <p className="text-sm text-(--color-foreground-muted)">Favori Araç/Piyasa</p>
                        </div>
                        <div className="rounded-lg border bg-(--color-muted) p-4 text-center">
                          <p className="text-2xl font-bold text-(--color-primary)">
                            {followedEconomicEvents.length + followedDividends.length + followedIPOs.length}
                          </p>
                          <p className="text-sm text-(--color-foreground-muted)">Takip Edilen</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ProfilPage() {
  return (
    <RequireAuth>
      <ProfilPageContent />
    </RequireAuth>
  )
}
