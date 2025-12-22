"use client"

import { NewsAdSlot } from '@/lib/news-ads-api'
import { useEffect, useRef } from 'react'

interface NewsAdSlotDisplayProps {
  slot: NewsAdSlot
}

export function NewsAdSlotDisplay({ slot }: NewsAdSlotDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Script URL varsa yükle
    if (slot.scriptUrl) {
      const script = document.createElement('script')
      script.src = slot.scriptUrl
      script.async = true
      containerRef.current.appendChild(script)

      return () => {
        if (containerRef.current && script.parentNode) {
          containerRef.current.removeChild(script)
        }
      }
    }
  }, [slot.scriptUrl])

  // Tarih kontrolü
  const now = new Date()
  const startDate = slot.startDate ? new Date(slot.startDate) : null
  const endDate = slot.endDate ? new Date(slot.endDate) : null

  if (startDate && now < startDate) return null
  if (endDate && now > endDate) return null

  // Responsive kontrolü
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024

  if (isMobile && !slot.showOnMobile) return null
  if (isTablet && !slot.showOnTablet) return null
  if (isDesktop && !slot.showOnDesktop) return null

  // Görsel reklam
  if (slot.imageUrl) {
    return (
      <div ref={containerRef} className="my-6">
        {slot.linkUrl ? (
          <a href={slot.linkUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={slot.imageUrl}
              alt="Reklam"
              className="w-full rounded-lg"
            />
          </a>
        ) : (
          <img
            src={slot.imageUrl}
            alt="Reklam"
            className="w-full rounded-lg"
          />
        )}
      </div>
    )
  }

  // HTML/JavaScript içerik
  if (slot.content) {
    return (
      <div
        ref={containerRef}
        className="my-6"
        dangerouslySetInnerHTML={{ __html: slot.content }}
      />
    )
  }

  return null
}

