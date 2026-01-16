import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Kripto para fiyatlarını formatlar
 * Çok küçük değerler için daha fazla ondalık basamak gösterir
 */
export function formatCryptoPrice(price: number): string {
  if (price === 0) return '0'
  
  // Çok küçük sayılar için özel formatlama
  if (price < 0.000001) {
    // 0.000001'den küçük sayılar için bilimsel gösterim veya çok sayıda basamak
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 8,
      maximumFractionDigits: 12,
      useGrouping: false
    })
  } else if (price < 0.0001) {
    // 0.0001'den küçük sayılar için 8 basamak
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 8,
      maximumFractionDigits: 8,
      useGrouping: false
    })
  } else if (price < 0.01) {
    // 0.01'den küçük sayılar için 6 basamak
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
      useGrouping: false
    })
  } else if (price < 1) {
    // 1'den küçük sayılar için 4 basamak
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
      useGrouping: false
    })
  } else if (price < 100) {
    // 100'den küçük sayılar için 2 basamak
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  } else {
    // Büyük sayılar için binlik ayraçlar ve 2 basamak
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
}

/**
 * Piyasa fiyatını türe göre formatlar
 */
export function formatMarketPrice(price: number, type: string, symbol?: string): string {
  if (type === 'Kripto Para') {
    return formatCryptoPrice(price)
  } else if (type === 'Emtia' && symbol === 'ONS_ALTIN') {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  } else if (type === 'Döviz') {
    return price.toLocaleString('tr-TR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
  } else {
    return price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
}
