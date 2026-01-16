import { getToolIcon } from "@/components/icons/tool-icons"
import type { LucideIcon } from "lucide-react"

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
  // Faiz Hesaplamaları
  {
    id: 'basit-faiz',
    name: 'Basit Faiz Hesaplama',
    slug: 'basit-faiz',
    description: 'Ana para üzerinden sabit faiz hesaplaması yapın',
    icon: 'Percent',
    category: 'Faiz',
    keywords: ['basit faiz', 'faiz', 'hesaplama', 'ana para'],
    color: 'text-(--color-primary)',
    bgColor: 'bg-(--color-primary)/10',
    order: 1,
  },
  {
    id: 'bilesik-faiz',
    name: 'Bileşik Faiz Hesaplama',
    slug: 'bilesik-faiz',
    description: 'Faizin faize yatırıldığı durumlarda toplam getiri hesaplayın',
    icon: 'TrendingUp',
    category: 'Faiz',
    keywords: ['bileşik faiz', 'faiz', 'hesaplama', 'getiri'],
    color: 'text-(--color-success)',
    bgColor: 'bg-(--color-success)/10',
    order: 2,
  },
  {
    id: 'yillik-getiri',
    name: 'Yıllık Getiri Hesaplama',
    slug: 'yillik-getiri',
    description: 'Yatırımınızın toplam ve yıllık getiri oranını hesaplayın',
    icon: 'TrendingUp',
    category: 'Yatırım',
    keywords: ['getiri', 'yatırım', 'yıllık getiri', 'roi'],
    color: 'text-(--color-success)',
    bgColor: 'bg-(--color-success)/10',
    order: 3,
  },
  {
    id: 'npv',
    name: 'Net Bugünkü Değer (NPV)',
    slug: 'npv',
    description: 'Yatırım projelerinin bugünkü değerini hesaplayın',
    icon: 'Calculator',
    category: 'Yatırım',
    keywords: ['npv', 'net bugünkü değer', 'yatırım', 'nakit akışı'],
    color: 'text-(--color-primary)',
    bgColor: 'bg-(--color-primary)/10',
    order: 4,
  },
  {
    id: 'irr',
    name: 'İç Verim Oranı (IRR)',
    slug: 'irr',
    description: 'NPV\'nin sıfır olduğu faiz oranını hesaplayın',
    icon: 'Target',
    category: 'Yatırım',
    keywords: ['irr', 'iç verim oranı', 'yatırım', 'faiz oranı'],
    color: 'text-(--color-primary)',
    bgColor: 'bg-(--color-primary)/10',
    order: 5,
  },
  {
    id: 'roi',
    name: 'ROI (Yatırım Getirisi)',
    slug: 'roi',
    description: 'Yatırımınızın getiri oranını yüzde olarak hesaplayın',
    icon: 'TrendingUp',
    category: 'Yatırım',
    keywords: ['roi', 'yatırım getirisi', 'getiri', 'karlılık'],
    color: 'text-(--color-success)',
    bgColor: 'bg-(--color-success)/10',
    order: 6,
  },
  {
    id: 'yatirim-karlilik',
    name: 'Yatırım Karlılık Hesaplama',
    slug: 'yatirim-karlilik',
    description: 'Yatırımın karlılık oranını hesaplayın',
    icon: 'BarChart3',
    category: 'Yatırım',
    keywords: ['yatırım', 'karlılık', 'getiri', 'roi'],
    color: 'text-(--color-success)',
    bgColor: 'bg-(--color-success)/10',
    order: 7,
  },
  {
    id: 'enflasyon-etkisi',
    name: 'Enflasyon Etkisi Hesaplama',
    slug: 'enflasyon-etkisi',
    description: 'Paranızın enflasyon sonrası satın alma gücünü hesaplayın',
    icon: 'TrendingDown',
    category: 'Yatırım',
    keywords: ['enflasyon', 'satın alma gücü', 'reel değer'],
    color: 'text-(--color-danger)',
    bgColor: 'bg-(--color-danger)/10',
    order: 8,
  },
  {
    id: 'yatirim-buyume-orani',
    name: 'Yatırım Büyüme Oranı',
    slug: 'yatirim-buyume-orani',
    description: 'Yıllık bileşik büyüme oranını hesaplayın (CAGR)',
    icon: 'LineChart',
    category: 'Yatırım',
    keywords: ['cagr', 'büyüme', 'yatırım', 'getiri oranı'],
    color: 'text-(--color-success)',
    bgColor: 'bg-(--color-success)/10',
    order: 9,
  },
  {
    id: 'faiz-orani-donusturme',
    name: 'Faiz Oranı Dönüştürme',
    slug: 'faiz-orani-donusturme',
    description: 'Yıllık, aylık ve günlük faiz oranlarını dönüştürün',
    icon: 'Percent',
    category: 'Faiz',
    keywords: ['faiz', 'dönüştürme', 'yıllık', 'aylık', 'günlük'],
    color: 'text-(--color-primary)',
    bgColor: 'bg-(--color-primary)/10',
    order: 10,
  },
  {
    id: 'toplam-faiz-maliyeti',
    name: 'Toplam Faiz Maliyeti Hesaplama',
    slug: 'toplam-faiz-maliyeti',
    description: 'Kredi için toplam faiz maliyetini hesaplayın',
    icon: 'Receipt',
    category: 'Kredi',
    keywords: ['faiz maliyeti', 'kredi', 'toplam faiz'],
    color: 'text-(--color-danger)',
    bgColor: 'bg-(--color-danger)/10',
    order: 11,
  },
  {
    id: 'aylik-taksit',
    name: 'Aylık Taksit Hesaplama',
    slug: 'aylik-taksit',
    description: 'Kredi aylık taksit tutarını hesaplayın',
    icon: 'Calculator',
    category: 'Kredi',
    keywords: ['taksit', 'kredi', 'aylık ödeme', 'pmt'],
    color: 'text-(--color-primary)',
    bgColor: 'bg-(--color-primary)/10',
    order: 12,
  },
  {
    id: 'amortisman-tablosu',
    name: 'Amortisman Tablosu',
    slug: 'amortisman-tablosu',
    description: 'Kredi ödeme planı ve amortisman tablosunu görüntüleyin',
    icon: 'FileText',
    category: 'Kredi',
    keywords: ['amortisman', 'kredi', 'ödeme planı', 'taksit tablosu'],
    color: 'text-(--color-primary)',
    bgColor: 'bg-(--color-primary)/10',
    order: 13,
  },
  {
    id: 'odeme-plani-ciktisi',
    name: 'Ödeme Planı Çıktısı',
    slug: 'odeme-plani-ciktisi',
    description: 'Kredi için detaylı ödeme planı ve çizelgesi oluşturun',
    icon: 'Receipt',
    category: 'Kredi',
    keywords: ['ödeme planı', 'çizelge', 'kredi', 'detaylı plan'],
    color: 'text-(--color-primary)',
    bgColor: 'bg-(--color-primary)/10',
    order: 14,
  },
  {
    id: 'break-even',
    name: 'Break-Even (Başabaş Noktası)',
    slug: 'break-even',
    description: 'Kâr/zarar eşitliğinin sağlandığı üretim miktarını bulun',
    icon: 'Target',
    category: 'İşletme',
    keywords: ['break-even', 'başabaş', 'maliyet', 'karlılık'],
    color: 'text-(--color-warning)',
    bgColor: 'bg-(--color-warning)/10',
    order: 15,
  },
  {
    id: 'marj-kar-orani',
    name: 'Marj ve Kar Oranı Hesaplama',
    slug: 'marj-kar-orani',
    description: 'Brüt kar marjı ve kar oranını hesaplayın',
    icon: 'BarChart3',
    category: 'İşletme',
    keywords: ['marj', 'kar oranı', 'brüt kar', 'karlılık'],
    color: 'text-(--color-success)',
    bgColor: 'bg-(--color-success)/10',
    order: 16,
  },
  {
    id: 'kar-zarar',
    name: 'Kâr / Zarar Hesaplama',
    slug: 'kar-zarar',
    description: 'Gelir ve giderleri karşılaştırarak net kâr/zararı hesaplayın',
    icon: 'Receipt',
    category: 'İşletme',
    keywords: ['kâr', 'zarar', 'gelir', 'gider'],
    color: 'text-(--color-primary)',
    bgColor: 'bg-(--color-primary)/10',
    order: 17,
  },
  {
    id: 'verimlilik-katsayisi',
    name: 'Verimlilik / Performans Katsayısı',
    slug: 'verimlilik-katsayisi',
    description: 'Çıktı/girdi oranını hesaplayarak verimliliği ölçün',
    icon: 'Zap',
    category: 'İşletme',
    keywords: ['verimlilik', 'performans', 'çıktı', 'girdi'],
    color: 'text-(--color-success)',
    bgColor: 'bg-(--color-success)/10',
    order: 18,
  },
  {
    id: 'calisma-sermayesi',
    name: 'Çalışma Sermayesi Hesaplama',
    slug: 'calisma-sermayesi',
    description: 'İşletmenin kısa vadeli finansal sağlığını ölçün',
    icon: 'Wallet',
    category: 'İşletme',
    keywords: ['çalışma sermayesi', 'likidite', 'dönen varlıklar'],
    color: 'text-(--color-primary)',
    bgColor: 'bg-(--color-primary)/10',
    order: 19,
  },
  {
    id: 'sermaye-ihtiyaci',
    name: 'İşletme Sermaye İhtiyacı',
    slug: 'sermaye-ihtiyaci',
    description: 'İşletmenin ihtiyaç duyduğu ek sermayeyi hesaplayın',
    icon: 'Briefcase',
    category: 'İşletme',
    keywords: ['sermaye', 'finansman', 'yatırım ihtiyacı'],
    color: 'text-(--color-warning)',
    bgColor: 'bg-(--color-warning)/10',
    order: 20,
  },
  {
    id: 'nakit-akisi-analizi',
    name: 'Nakit Akışı Analizi',
    slug: 'nakit-akisi-analizi',
    description: 'Giriş ve çıkış nakit akışlarını analiz edin',
    icon: 'Coins',
    category: 'İşletme',
    keywords: ['nakit akışı', 'cash flow', 'analiz'],
    color: 'text-(--color-primary)',
    bgColor: 'bg-(--color-primary)/10',
    order: 21,
  },
  {
    id: 'basit-butce',
    name: 'Basit Bütçe Planlayıcı',
    slug: 'basit-butce',
    description: 'Gelir ve giderlerinizi karşılaştırın',
    icon: 'PieChart',
    category: 'Bütçe',
    keywords: ['bütçe', 'gelir', 'gider', 'tasarruf'],
    color: 'text-(--color-primary)',
    bgColor: 'bg-(--color-primary)/10',
    order: 22,
  },
  {
    id: 'gelir-gider-dengesi',
    name: 'Gelir – Gider Dengesi',
    slug: 'gelir-gider-dengesi',
    description: 'Gelir ve giderlerinizi analiz ederek bütçe dengesini değerlendirin',
    icon: 'PieChart',
    category: 'Bütçe',
    keywords: ['gelir', 'gider', 'denge', 'bütçe analizi'],
    color: 'text-(--color-primary)',
    bgColor: 'bg-(--color-primary)/10',
    order: 23,
  },
  {
    id: 'yillik-tasarruf-hedefi',
    name: 'Yıllık Tasarruf Hedefi Hesaplama',
    slug: 'yillik-tasarruf-hedefi',
    description: 'Hedef tutara ulaşmak için gereken aylık tasarruf miktarını bulun',
    icon: 'PiggyBank',
    category: 'Bütçe',
    keywords: ['tasarruf', 'hedef', 'planlama'],
    color: 'text-(--color-success)',
    bgColor: 'bg-(--color-success)/10',
    order: 24,
  },
  {
    id: 'ortalama-getiri',
    name: 'Ortalama Getiri Hesaplama',
    slug: 'ortalama-getiri',
    description: 'Yatırım getirilerinin aritmetik ortalamasını hesaplayın',
    icon: 'BarChart3',
    category: 'Yatırım',
    keywords: ['ortalama', 'getiri', 'aritmetik ortalama'],
    color: 'text-(--color-success)',
    bgColor: 'bg-(--color-success)/10',
    order: 25,
  },
]

// Icon mapping - yeni icon sistemi kullanıyor
export function getIconForTool(iconName: string): LucideIcon {
  return getToolIcon(iconName)
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
