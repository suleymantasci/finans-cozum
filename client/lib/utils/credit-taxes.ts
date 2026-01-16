/**
 * KKDF ve BSMV hesaplama utility fonksiyonları
 * KKDF (Kaynak Kullanımı Destekleme Fonu)
 * BSMV (Banka Sigorta Muameleleri Vergisi)
 */

export type CreditType = 'none' | 'ihtiyac' | 'konut' | 'tasit' | 'ticari'

export interface TaxRates {
  kkdf: number // KKDF oranı (0-1 arası, örn. 0.15 = %15)
  bsmv: number // BSMV oranı (0-1 arası, örn. 0.05 = %5)
}

/**
 * Kredi türüne göre KKDF ve BSMV oranlarını döndürür
 * KKDF: Ev kredisi (konut) hariç %15, ev kredisinde 0
 * BSMV: Ev kredisinde 0, İhtiyaç ve taşıtta %15, Diğerlerinde %5
 */
export function getTaxRates(creditType: CreditType): TaxRates {
  switch (creditType) {
    case 'ihtiyac':
      return {
        kkdf: 0.15, // %15
        bsmv: 0.15, // %15
      }
    case 'tasit':
      return {
        kkdf: 0.15, // %15
        bsmv: 0.15, // %15
      }
    case 'konut':
      return {
        kkdf: 0, // Ev kredisinde muaf
        bsmv: 0, // Ev kredisinde 0
      }
    case 'ticari':
      return {
        kkdf: 0.15, // Ev kredisi hariç %15
        bsmv: 0.05, // Diğerlerinde %5
      }
    case 'none':
    default:
      return {
        kkdf: 0,
        bsmv: 0,
      }
  }
}

/**
 * Faiz üzerinden KKDF ve BSMV hesaplar
 * @param interestAmount - Faiz tutarı
 * @param creditType - Kredi türü
 * @returns KKDF ve BSMV tutarları
 */
export function calculateTaxes(
  interestAmount: number,
  creditType: CreditType
): { kkdf: number; bsmv: number } {
  const rates = getTaxRates(creditType)
  
  const kkdf = interestAmount * rates.kkdf
  const bsmv = interestAmount * rates.bsmv
  
  return { kkdf, bsmv }
}

/**
 * Faiz oranını yıllıktan aylığa veya aylıktan yıllığa çevirir
 */
export function convertInterestRate(
  rate: number,
  from: 'annual' | 'monthly',
  to: 'annual' | 'monthly'
): number {
  if (from === to) return rate
  
  if (from === 'annual' && to === 'monthly') {
    return rate / 12
  } else if (from === 'monthly' && to === 'annual') {
    return rate * 12
  }
  
  return rate
}
