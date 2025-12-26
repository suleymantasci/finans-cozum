import { type ReactElement } from 'react'
import {
  Calculator,
  Calendar,
  PiggyBank,
  CreditCard,
  DollarSign,
  Percent,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Building2,
  Coins,
  Wallet,
  Banknote,
  Receipt,
  PieChart,
  BarChart3,
  LineChart,
  Target,
  Zap,
  Shield,
  Clock,
  Settings,
  HelpCircle,
  FileText,
  Users,
  Home,
  Car,
  ShoppingCart,
  Briefcase,
  StickyNote,
  type LucideIcon,
} from 'lucide-react'

// Icon mapping - icon isimlerini Lucide icon component'lerine map eder
// Normalize işlemi getToolIcon fonksiyonunda yapıldığı için sadece temel isimler yeterli
// Ancak bazı özel alias'lar için ekstra mapping ekliyoruz
export const toolIcons: Record<string, LucideIcon> = {
  // Hesaplama araçları - temel isimler
  calculator: Calculator,
  calendar: Calendar,
  piggybank: PiggyBank,
  creditcard: CreditCard,
  dollarsign: DollarSign,
  percent: Percent,
  
  // Özel alias'lar
  'loan-calculator': Calculator,
  loancalculator: Calculator,
  'vade-calculator': Calendar,
  vadecalculator: Calendar,
  'deposit-calculator': PiggyBank,
  depositcalculator: PiggyBank,
  mevduat: PiggyBank,
  'credit-card-debt': CreditCard,
  creditcarddebtcalculator: CreditCard,
  'currency-converter': DollarSign,
  currencyconverter: DollarSign,
  doviz: DollarSign,
  'interest-calculator': Percent,
  interestcalculator: Percent,
  faiz: Percent,
  
  // Diğer yaygın iconlar
  trendingup: TrendingUp,
  'trending-up': TrendingUp,
  trendingdown: TrendingDown,
  'trending-down': TrendingDown,
  building2: Building2,
  building: Building2,
  coins: Coins,
  wallet: Wallet,
  banknote: Banknote,
  receipt: Receipt,
  piechart: PieChart,
  'pie-chart': PieChart,
  barchart3: BarChart3,
  'bar-chart': BarChart3,
  linechart: LineChart,
  'line-chart': LineChart,
  target: Target,
  zap: Zap,
  shield: Shield,
  clock: Clock,
  settings: Settings,
  helpcircle: HelpCircle,
  'help-circle': HelpCircle,
  filetext: FileText,
  'file-text': FileText,
  users: Users,
  home: Home,
  car: Car,
  shoppingcart: ShoppingCart,
  'shopping-cart': ShoppingCart,
  briefcase: Briefcase,
  stickynote: StickyNote,
  'sticky-note': StickyNote,
  arrowright: ArrowRight,
  'arrow-right': ArrowRight,
}

// Default icon (icon bulunamazsa)
export const DefaultToolIcon = Calculator

/**
 * Icon ismine göre Lucide Icon component'ini döndürür
 * Icon bulunamazsa default icon döner
 */
export function getToolIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) {
    return DefaultToolIcon
  }
  
  // Önce normalize edilmiş ismi dene
  const normalizedName = iconName.toLowerCase().trim().replace(/\s+/g, '-')
  
  // Normalize edilmiş isimle ara
  if (toolIcons[normalizedName]) {
    return toolIcons[normalizedName]
  }
  
  // Orijinal isimle ara (büyük/küçük harf duyarsız)
  const normalizedNoDash = normalizedName.replace(/-/g, '')
  if (toolIcons[normalizedNoDash]) {
    return toolIcons[normalizedNoDash]
  }
  
  // Orijinal ismi olduğu gibi ara
  if (toolIcons[iconName]) {
    return toolIcons[iconName]
  }
  
  // Hiçbiri bulunamazsa default icon döndür
  return DefaultToolIcon
}

/**
 * Icon component'ini render etmek için helper function
 */
export function renderToolIcon(
  iconName: string | null | undefined,
  className?: string,
  size?: number
): ReactElement {
  const IconComponent = getToolIcon(iconName)
  const sizeClass = size ? `h-${size} w-${size}` : 'h-6 w-6'
  
  return <IconComponent className={className || sizeClass} />
}

