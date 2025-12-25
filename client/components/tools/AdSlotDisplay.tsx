"use client"

import { useEffect, useState } from 'react'
import { ToolAdSlot } from '@/lib/tools-api'

interface AdSlotDisplayProps {
  slot: ToolAdSlot
}

export function AdSlotDisplay({ slot }: AdSlotDisplayProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Responsive kontrolü
    const checkVisibility = () => {
      const isMobile = window.innerWidth < 768
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
      const isDesktop = window.innerWidth >= 1024

      const shouldShow =
        (isMobile && slot.showOnMobile) ||
        (isTablet && slot.showOnTablet) ||
        (isDesktop && slot.showOnDesktop)

      setIsVisible(shouldShow)
    }

    checkVisibility()
    window.addEventListener('resize', checkVisibility)
    return () => window.removeEventListener('resize', checkVisibility)
  }, [slot])

  // Tarih kontrolü
  const now = new Date()
  const isInDateRange =
    (!slot.startDate || new Date(slot.startDate) <= now) &&
    (!slot.endDate || new Date(slot.endDate) >= now)

  if (!slot.isActive || !isVisible || !isInDateRange) {
    return null
  }

  // Template'den gelen içerik varsa onu kullan, yoksa slot'un kendi içeriğini kullan
  const content = slot.template?.content || slot.content
  const scriptUrl = slot.template?.scriptUrl || slot.scriptUrl
  const imageUrl = slot.template?.imageUrl || slot.imageUrl
  const linkUrl = slot.template?.linkUrl || slot.linkUrl

  return (
    <div
      className="tool-ad-slot my-4 w-full"
      data-position={slot.position}
      data-slot-id={slot.id}
    >
      {content && (
        <div
          className="ad-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
      {scriptUrl && (
        <script src={scriptUrl} async />
      )}
      {imageUrl && (
        <a
          href={linkUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={imageUrl}
            alt="Reklam"
            className="w-full rounded-lg"
          />
        </a>
      )}
    </div>
  )
}


