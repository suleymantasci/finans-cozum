import { 
  Calculator, 
  Calendar, 
  DollarSign, 
  PiggyBank, 
  CreditCard, 
  Percent,
  LucideIcon 
} from "lucide-react"

export interface Tool {
  id: string
  name: string
  slug: string
  description: string
  icon: string // Lucide icon name
  category: string
  keywords: string[]
  color: string
  bgColor: string
  order: number
}

export const tools: Tool[] = [
  {
    id: 'kredi-hesaplama',
    name: 'Kredi Hesaplama',
    slug: 'kredi-hesaplama',
    description: 'İhtiyaç, konut ve taşıt kredisi hesaplayın, aylık taksitlerinizi öğrenin',
    icon: 'Calculator',
    category: 'Kredi',
    keywords: ['kredi', 'taksit', 'hesaplama', 'konut kredisi', 'ihtiyaç kredisi', 'taşıt kredisi'],
    color: 'text-(--color-primary)',
    bgColor: 'bg-(--color-primary)/10',
    order: 1,
  },
  {
    id: 'vade-hesaplama',
    name: 'Vade Hesaplama',
    slug: 'vade-hesaplama',
    description: 'Yatırımlarınızın vade sonunda kazancını hesaplayın',
    icon: 'Calendar',
    category: 'Yatırım',
    keywords: ['vade', 'yatırım', 'getiri', 'hesaplama'],
    color: 'text-(--color-accent)',
    bgColor: 'bg-(--color-accent)/10',
    order: 2,
  },
  {
    id: 'doviz-cevirici',
    name: 'Döviz Çevirici',
    slug: 'doviz-cevirici',
    description: 'Anlık kurlarla döviz ve kripto para çevirisi yapın',
    icon: 'DollarSign',
    category: 'Döviz',
    keywords: ['döviz', 'kur', 'çevirici', 'dolar', 'euro', 'sterlin', 'kripto'],
    color: 'text-(--color-success)',
    bgColor: 'bg-(--color-success)/10',
    order: 3,
  },
  {
    id: 'mevduat-hesaplama',
    name: 'Mevduat Hesaplama',
    slug: 'mevduat-hesaplama',
    description: 'Mevduat hesabınızın getirisini ve faiz kazancını hesaplayın',
    icon: 'PiggyBank',
    category: 'Yatırım',
    keywords: ['mevduat', 'faiz', 'getiri', 'hesaplama', 'tasarruf'],
    color: 'text-(--color-warning)',
    bgColor: 'bg-(--color-warning)/10',
    order: 4,
  },
  {
    id: 'kredi-karti-borc',
    name: 'Kredi Kartı Borç Hesaplama',
    slug: 'kredi-karti-borc',
    description: 'Kredi kartı borcunuzun taksit planını oluşturun',
    icon: 'CreditCard',
    category: 'Kredi',
    keywords: ['kredi kartı', 'borç', 'taksit', 'hesaplama', 'ödeme planı'],
    color: 'text-(--color-danger)',
    bgColor: 'bg-(--color-danger)/10',
    order: 5,
  },
  {
    id: 'faiz-hesaplama',
    name: 'Faiz Hesaplama',
    slug: 'faiz-hesaplama',
    description: 'Basit ve bileşik faiz hesaplamaları yapın',
    icon: 'Percent',
    category: 'Yatırım',
    keywords: ['faiz', 'basit faiz', 'bileşik faiz', 'hesaplama'],
    color: 'text-(--color-primary)',
    bgColor: 'bg-(--color-primary)/10',
    order: 6,
  },
]

// Icon mapping
export const iconMap: Record<string, LucideIcon> = {
  Calculator,
  Calendar,
  DollarSign,
  PiggyBank,
  CreditCard,
  Percent,
}

// Arama fonksiyonu
export function searchTools(query: string, category?: string): Tool[] {
  const normalizedQuery = query.toLowerCase().trim()
  
  if (!normalizedQuery && !category) {
    return tools.sort((a, b) => a.order - b.order)
  }
  
  return tools
    .filter(tool => {
      // Kategori filtresi
      const matchesCategory = !category || tool.category === category
      
      if (!matchesCategory) return false
      
      // Arama yoksa sadece kategoriye göre filtrele
      if (!normalizedQuery) return true
      
      // Arama sorgusu kontrolü
      const matchesName = tool.name.toLowerCase().includes(normalizedQuery)
      const matchesDescription = tool.description.toLowerCase().includes(normalizedQuery)
      const matchesKeywords = tool.keywords.some(keyword => 
        keyword.toLowerCase().includes(normalizedQuery)
      )
      
      return matchesName || matchesDescription || matchesKeywords
    })
    .sort((a, b) => a.order - b.order)
}

// Kategorileri getir
export function getCategories(): string[] {
  return [...new Set(tools.map(tool => tool.category))].sort()
}

// Slug'a göre araç bul
export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find(tool => tool.slug === slug)
}

