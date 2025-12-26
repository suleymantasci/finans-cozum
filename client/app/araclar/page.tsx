"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Search, X } from "lucide-react"
import { tools, searchTools, getCategories, getIconForTool } from "@/lib/tools/tools"

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  
  const categories = useMemo(() => getCategories(), [])
  
  const filteredTools = useMemo(() => {
    return searchTools(searchQuery, selectedCategory || undefined)
  }, [searchQuery, selectedCategory])
  
  const clearSearch = () => {
    setSearchQuery("")
    setSelectedCategory("")
  }
  
  const hasActiveFilters = searchQuery || selectedCategory

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Finans Hesaplama Araçları</h1>
        <p className="mx-auto max-w-2xl text-lg text-(--color-foreground-muted)">
          Finansal kararlarınızı daha bilinçli vermek için ihtiyacınız olan tüm hesaplama araçları
        </p>
      </div>

      {/* Arama ve Filtreleme */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-foreground-muted)" />
            <Input
              placeholder="Araç ara... (isim, açıklama, anahtar kelime)"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Tüm Kategoriler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <button
              onClick={clearSearch}
              className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors hover:bg-(--color-muted)"
            >
              <X className="h-4 w-4" />
              Temizle
            </button>
          )}
        </div>
        
        {/* Sonuç sayısı */}
        <div className="flex items-center justify-between text-sm text-(--color-foreground-muted)">
          <span>
            {filteredTools.length} araç bulundu
            {hasActiveFilters && ` (${tools.length} toplam)`}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearSearch}
              className="text-(--color-primary) hover:underline"
            >
              Filtreleri temizle
            </button>
          )}
        </div>
      </div>

      {/* Araç Listesi */}
      {filteredTools.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-(--color-foreground-muted)">
              Arama kriterlerinize uygun araç bulunamadı.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearSearch}
                className="mt-4 text-(--color-primary) hover:underline"
              >
                Tüm araçları göster
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => {
            const IconComponent = getIconForTool(tool.icon)
            
            return (
              <Link key={tool.id} href={`/araclar/${tool.slug}`}>
                <Card className="group h-full transition-all hover:shadow-lg hover:border-(--color-primary)/50">
                  <CardHeader>
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${tool.bgColor}`}>
                        {IconComponent && (
                          <IconComponent className={`h-6 w-6 ${tool.color}`} />
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {tool.category}
                      </Badge>
                    </div>
                    <CardTitle className="mb-2 flex items-center justify-between text-xl">
                      {tool.name}
                      <ArrowRight className="h-5 w-5 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                    </CardTitle>
                    <CardDescription className="text-base">{tool.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
