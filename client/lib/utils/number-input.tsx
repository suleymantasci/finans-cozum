"use client"

import { Input } from '@/components/ui/input'
import { forwardRef, useCallback, useImperativeHandle, useRef, useState, useEffect } from 'react'

interface FormattedNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number
  onChange: (value: number | undefined) => void
  allowDecimal?: boolean
}

/**
 * Formatlı sayı input bileşeni
 * - Binlik ayraçlar: 1.000.000 (sadece blur'da gösterilir, yazarken formatlanmaz)
 * - Ondalık ayraç: virgül (UI'da) veya nokta (kabul edilir, virgüle çevrilir)
 * - Değer tamamen silinebilir
 * - Sadece rakam ve ondalık ayracı kabul eder
 */
export const FormattedNumberInput = forwardRef<HTMLInputElement, FormattedNumberInputProps>(
  ({ value, onChange, allowDecimal = true, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [displayValue, setDisplayValue] = useState<string>('')
    const [isFocused, setIsFocused] = useState(false)

    useImperativeHandle(ref, () => inputRef.current!)

    // Sayıyı formatla (binlik ayraçlar)
    const formatNumber = useCallback((num: number | undefined): string => {
      if (num === undefined || num === null || isNaN(num)) return ''
      
      const numStr = num.toString()
      const [integerPart, decimalPart] = numStr.split('.')
      
      // Binlik ayraçlar ekle
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      
      // Ondalık kısmı varsa ekle (virgül ile)
      if (decimalPart !== undefined && allowDecimal) {
        return formattedInteger + ',' + decimalPart
      }
      
      return formattedInteger
    }, [allowDecimal])

    // String'den sayıya çevir (formattan arındır)
    const parseValue = useCallback((str: string): number | undefined => {
      if (!str || str.trim() === '') return undefined
      
      // Tüm noktaları kaldır (binlik ayraçlar), virgülü noktaya çevir
      const cleaned = str.replace(/\./g, '').replace(',', '.')
      const parsed = parseFloat(cleaned)
      
      return isNaN(parsed) ? undefined : parsed
    }, [])

    // String'i temizle (binlik ayraçları kaldır, sadece rakam ve ondalık ayraç bırak)
    const cleanInput = useCallback((str: string): string => {
      // Virgülü noktaya çevir (iç işlem için)
      let cleaned = str.replace(',', '.')
      
      // Birden fazla nokta varsa, sadece ilkini bırak (ondalık ayraç)
      const parts = cleaned.split('.')
      if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('')
      }
      
      // Noktayı tekrar virgüle çevir (gösterim için)
      return cleaned.replace('.', ',')
    }, [])

    const handleFocus = useCallback(() => {
      setIsFocused(true)
      // Focus'ta formatı kaldır, sadece ham değeri göster
      if (value !== undefined && value !== null && !isNaN(value)) {
        // Ondalık kısmı varsa virgül ile göster, yoksa sadece rakamları göster
        const numStr = value.toString()
        const [intPart, decPart] = numStr.split('.')
        const display = decPart ? `${intPart},${decPart}` : intPart
        setDisplayValue(display)
      }
    }, [value])

    const handleBlur = useCallback(() => {
      setIsFocused(false)
      // Blur'da formatla
      if (value !== undefined && value !== null && !isNaN(value)) {
        setDisplayValue(formatNumber(value))
      }
    }, [value, formatNumber])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      
      // Boş bırakılabilir
      if (inputValue === '') {
        setDisplayValue('')
        onChange(undefined)
        return
      }
      
      // Sadece rakam, nokta, virgül ve eksi işaretine izin ver
      if (!/^[\d.,-]*$/.test(inputValue)) {
        return
      }
      
      // Eğer focus'taysak, binlik ayraçları kaldır (yazmaya devam edebilmek için)
      let cleanedInput = inputValue
      if (isFocused) {
        // Tüm noktaları kaldır (binlik ayraçlar olabilir)
        // Ama önce virgül ve nokta kontrolü yap
        const hasComma = inputValue.includes(',')
        const hasDot = inputValue.includes('.')
        
        if (hasComma && hasDot) {
          // Son girileni kullan
          const lastComma = inputValue.lastIndexOf(',')
          const lastDot = inputValue.lastIndexOf('.')
          
          if (lastComma > lastDot) {
            // Virgül son, noktaları kaldır
            cleanedInput = inputValue.replace(/\./g, '')
          } else {
            // Nokta son, virgülleri kaldır, noktayı virgüle çevir
            cleanedInput = inputValue.replace(/,/g, '').replace('.', ',')
          }
        } else if (hasDot && !hasComma) {
          // Nokta varsa, ondalık ayraç olarak kabul et (virgüle çevir)
          // Ama önce noktadan önceki kısımdaki tüm noktaları kaldır (binlik ayraç olabilir)
          const lastDotIndex = inputValue.lastIndexOf('.')
          const beforeDot = inputValue.substring(0, lastDotIndex).replace(/\./g, '')
          const afterDot = inputValue.substring(lastDotIndex + 1)
          cleanedInput = beforeDot + ',' + afterDot
        } else {
          // Sadece noktalar varsa (binlik ayraç), hepsini kaldır
          cleanedInput = inputValue.replace(/\./g, '')
        }
      } else {
        // Focus'ta değilsek, temizleme yap
        cleanedInput = cleanInput(inputValue)
      }
      
      // Ondalık ayracı kontrolü
      const commaCount = (cleanedInput.match(/,/g) || []).length
      if (commaCount > 1) {
        // Birden fazla virgül varsa, sadece ilkini bırak
        const parts = cleanedInput.split(',')
        cleanedInput = parts[0] + ',' + parts.slice(1).join('')
      }
      
      if (!allowDecimal && cleanedInput.includes(',')) {
        // Ondalık izin verilmiyor, virgülü kaldır
        cleanedInput = cleanedInput.replace(',', '')
      }
      
      setDisplayValue(cleanedInput)
      
      // Parse et ve onChange çağır
      const parsed = parseValue(cleanedInput)
      if (parsed !== undefined) {
        onChange(parsed)
      } else if (cleanedInput === '') {
        onChange(undefined)
      }
    }, [onChange, parseValue, allowDecimal, isFocused, cleanInput])

    // İlk render'da ve value değiştiğinde formatla (focus'ta değilse)
    useEffect(() => {
      if (!isFocused) {
        if (value !== undefined && value !== null && !isNaN(value)) {
          setDisplayValue(formatNumber(value))
        } else {
          setDisplayValue('')
        }
      }
    }, [value, isFocused, formatNumber])

    return (
      <Input
        {...props}
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    )
  }
)

FormattedNumberInput.displayName = 'FormattedNumberInput'
