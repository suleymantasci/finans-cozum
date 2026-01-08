"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Bell, Share2, TrendingUp, Calendar, Loader2, Building2, MapPin, Globe, FileText, ExternalLink, ChevronDown } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ipoApi, IpoResponse, IpoStatus } from "@/lib/ipo-api"
import { useRouter } from "next/navigation"

interface IpoDetailClientPageProps {
  bistCode: string
}

export default function IpoDetailClientPage({ bistCode }: IpoDetailClientPageProps) {
  const router = useRouter()
  const [data, setData] = useState<IpoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    loadData()
  }, [bistCode])

  const loadData = async () => {
    try {
      setLoading(true)
      const result = await ipoApi.getIpoDetail(bistCode)
      setData(result)
    } catch (error) {
      console.error("Failed to load IPO detail:", error)
    } finally {
      setLoading(false)
    }
  }

  const getLogoUrl = (path?: string) => {
    if (!path) return "/placeholder-logo.png"
    if (path.startsWith("http")) return path
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    return `${apiUrl}${path}`
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('tr-TR').format(num)
  }

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(2)}%`
  }

  // Type guard for new results format
  const isNewResultsFormat = (data: any): data is { summary: Array<{ type: string; personCount: number; lotCount: number; ratio: number }>; notes: string[] } => {
    return data && typeof data === 'object' && 'summary' in data && 'notes' in data && Array.isArray(data.summary)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background py-8 container mx-auto px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Halka Arz Bulunamadı</h1>
        <Link href="/halka-arz-takvimi">
          <Button>Listeye Dön</Button>
        </Link>
      </div>
    )
  }

  const { listing, detail, results, applicationPlaces } = data

  const renderStatusBadge = (status: IpoStatus) => {
    switch (status) {
      case IpoStatus.UPCOMING:
        return <Badge className="bg-blue-600">Yaklaşan</Badge>
      case IpoStatus.COMPLETED:
        return <Badge variant="secondary">Gerçekleşti</Badge>
      case IpoStatus.DRAFT:
        return <Badge variant="outline" className="border-dashed">Taslak</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/halka-arz-takvimi" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Halka Arz Takvimine Dön
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-4">
                    {listing.logoUrl ? (
                        <img 
                            src={getLogoUrl(listing.logoUrl)} 
                            alt={listing.companyName}
                            className="w-20 h-20 object-contain rounded bg-white p-1 border shadow-sm"
                        />
                    ) : (
                        <div className="w-20 h-20 bg-secondary rounded flex items-center justify-center text-2xl font-bold shadow-sm">
                            {!listing.bistCode.startsWith("TEMP-") ? listing.bistCode.substring(0,2) : "?"}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            {!listing.bistCode.startsWith("TEMP-") && (
                            <h1 className="text-3xl font-bold">{listing.bistCode}</h1>
                            )}
                            {listing.bistCode.startsWith("TEMP-") && (
                              <h1 className="text-3xl font-bold">-</h1>
                            )}
                            {renderStatusBadge(listing.status)}
                        </div>
                        <p className="text-lg font-medium text-muted-foreground">{listing.companyName}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={isFollowing ? "default" : "outline"}
                        onClick={() => setIsFollowing(!isFollowing)}
                    >
                        <Bell className="mr-2 h-4 w-4" />
                        {isFollowing ? "Takip Ediliyor" : "Takip Et"}
                    </Button>
                    <Button variant="outline">
                        <Share2 className="mr-2 h-4 w-4" />
                        Paylaş
                    </Button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                {/* Summary Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Halka Arz Özeti</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        {listing.status !== IpoStatus.DRAFT && (
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Halka Arz Tarihi</span>
                            <span className="font-medium">{listing.ipoDate}</span>
                        </div>
                        )}
                         <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Fiyat</span>
                            <span className="font-medium text-primary text-lg">{detail?.ipoPrice || "-"}</span>
                        </div>
                         <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Dağıtım Yöntemi</span>
                            <span className="font-medium">{detail?.distributionMethod || "-"}</span>
                        </div>
                         <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Lot Sayısı</span>
                            <span className="font-medium">{detail?.shareAmount || "-"}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Aracı Kurum</span>
                            <span className="font-medium">{detail?.intermediary || "-"}</span>
                        </div>
                         <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Pazar</span>
                            <span className="font-medium">{detail?.market || "-"}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Özet Bilgiler */}
                {detail?.summaryInfo && Array.isArray(detail.summaryInfo) && detail.summaryInfo.length > 0 && (
                    <Collapsible defaultOpen={false}>
                        <Card>
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-secondary/5 transition-colors group">
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Özet Bilgiler</CardTitle>
                                        <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="space-y-6">
                                    {detail.summaryInfo.map((item: any, index: number) => (
                                        <div key={index} className="space-y-3 pb-6 border-b last:border-b-0 last:pb-0">
                                            {item.title && (
                                                <h4 className="font-semibold text-base text-primary">{item.title}</h4>
                                            )}
                                            {item.content && (
                                                <div 
                                                    className="text-sm text-muted-foreground leading-relaxed"
                                                    dangerouslySetInnerHTML={{ __html: item.content }}
                                                />
                                            )}
                                            {item.table && item.table.headers && item.table.headers.length > 0 && (
                                                <div className="overflow-x-auto rounded-lg border mt-3">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-secondary/30">
                                                            <tr>
                                                                {item.table.headers.map((header: string, hIndex: number) => (
                                                                    <th key={hIndex} className="px-4 py-2 text-left font-semibold">
                                                                        {header}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y">
                                                            {item.table.rows && item.table.rows.map((row: string[], rIndex: number) => (
                                                                <tr key={rIndex} className="hover:bg-secondary/10 cursor-pointer">
                                                                    {row.map((cell: string, cIndex: number) => (
                                                                        <td key={cIndex} className="px-4 py-2">
                                                                            {cell}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                )}

                <Tabs defaultValue="company" className="w-full">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="company">Şirket Hakkında</TabsTrigger>
                        {applicationPlaces && applicationPlaces.length > 0 && listing.status !== IpoStatus.COMPLETED && (
                        <TabsTrigger value="places">Başvuru Yerleri</TabsTrigger>
                        )}
                        {results && <TabsTrigger value="results">Sonuçlar</TabsTrigger>}
                        {detail?.attachments && Array.isArray(detail.attachments) && detail.attachments.length > 0 && (
                            <TabsTrigger value="attachments">Ekler</TabsTrigger>
                        )}
                    </TabsList>
                    
                    <TabsContent value="company" className="mt-4 space-y-4">
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="font-semibold mb-2">Şirket Tanıtımı</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                    {detail?.companyDescription || "Açıklama bulunmuyor."}
                                </p>
                                
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {detail?.foundedDate && (
                                       <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>Kuruluş: {detail.foundedDate}</span>
                                       </div>
                                     )}
                                     {detail?.city && (
                                       <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>Şehir: {detail.city}</span>
                                       </div>
                                     )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {applicationPlaces && applicationPlaces.length > 0 && listing.status !== IpoStatus.COMPLETED && (
                    <TabsContent value="places" className="mt-4">
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Konsorsiyum ve Başvuru Yerleri</CardTitle>
                            </CardHeader>
                            <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {applicationPlaces.map(place => (
                                            <div key={place.id} className="flex items-center gap-2 text-sm p-2 border rounded hover:bg-secondary/20">
                                                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <span className={place.isUnlisted ? "line-through text-muted-foreground" : ""}>
                                                    {place.name}
                                                </span>
                                                {place.isConsortium && (
                                                    <Badge variant="secondary" className="text-[10px] ml-auto flex-shrink-0">
                                                        Konsorsiyum
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    )}

                    {results && (
                        <TabsContent value="results" className="mt-4">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Halka Arz Sonuçları</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isNewResultsFormat(results.resultsData) ? (
                                        <div className="space-y-6">
                                            {/* Results Table */}
                                            <div className="overflow-x-auto rounded-lg border">
                                                <table className="w-full">
                                                    <thead className="bg-secondary/30">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold">Yatırımcı Grubu</th>
                                                            <th className="px-4 py-3 text-right text-sm font-semibold">Kişi</th>
                                                            <th className="px-4 py-3 text-right text-sm font-semibold">Lot</th>
                                                            <th className="px-4 py-3 text-right text-sm font-semibold">Oran</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y">
                                                        {results.resultsData.summary.map((item, index) => {
                                                            const isTotal = item.type.toLowerCase() === 'toplam'
                                                            return (
                                                                <tr 
                                                                    key={index}
                                                                    className={isTotal ? "bg-secondary/20 font-semibold" : "hover:bg-secondary/10"}
                                                                >
                                                                    <td className="px-4 py-3 text-sm">
                                                                        {item.type}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-right font-medium">
                                                                        {formatNumber(item.personCount)}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-right font-medium">
                                                                        {formatNumber(item.lotCount)}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-right font-medium">
                                                                        {formatPercentage(item.ratio)}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Notes Section */}
                                            {results.resultsData.notes && results.resultsData.notes.length > 0 && (
                                                <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary/50">
                                                    <h4 className="text-sm font-semibold mb-2">Notlar</h4>
                                                    <ul className="space-y-1">
                                                        {results.resultsData.notes.map((note, index) => (
                                                            <li key={index} className="text-sm text-muted-foreground">
                                                                {note}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                    <div className="bg-secondary/10 p-4 rounded-md overflow-x-auto">
                                        <pre className="text-xs whitespace-pre-wrap font-mono">
                                            {JSON.stringify(results.resultsData, null, 2)}
                                        </pre>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {detail?.attachments && Array.isArray(detail.attachments) && detail.attachments.length > 0 && (
                        <TabsContent value="attachments" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ekler</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {detail.attachments.map((attachment: any, index: number) => (
                                            <a
                                                key={index}
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-secondary/20 transition-colors group"
                                            >
                                                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                <span className="flex-1 text-sm font-medium group-hover:text-primary">
                                                    {attachment.title || `Ek ${index + 1}`}
                                                </span>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Hızlı Bilgiler</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">BIST Kodu</span>
                            <span className="font-bold">{listing.bistCode}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">İlk İşlem Tarihi</span>
                            <span className="font-medium">{detail?.firstTradeDate || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Fiili Dolaşım</span>
                            <span className="font-medium">{detail?.actualCirculationPct || "-"}</span>
                        </div>
                    </CardContent>
                </Card>
                
                {/* 
                Could add "Latest News" or "Related IPOs" here. 
                */}
            </div>
        </div>
      </div>
    </div>
  )
}
