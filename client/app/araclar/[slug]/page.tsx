import { notFound } from 'next/navigation'
import { toolsApi } from '@/lib/tools-api'
import { Metadata } from 'next'
import { ToolPageClient } from './ToolPageClient'

interface ToolPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const tool = await toolsApi.getBySlug(slug)
    return {
      title: tool.metaTitle || tool.name,
      description: tool.metaDescription || tool.description,
      keywords: tool.keywords,
    }
  } catch {
    return {
      title: 'Araç Bulunamadı',
    }
  }
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params
  let tool
  let adSlots
  let toolData = null

  try {
    tool = await toolsApi.getBySlug(slug)
    adSlots = await toolsApi.getActiveAdSlots(tool.id)

    // DATABASE veya EXTERNAL_API tipi için veri çek
    if (tool.dataSourceType === 'DATABASE' || tool.dataSourceType === 'EXTERNAL_API') {
      try {
        const dataResponse = await toolsApi.getToolData(tool.id)
        toolData = dataResponse.data
      } catch (error) {
        console.error('Tool data yüklenemedi:', error)
      }
    }
  } catch (error) {
    console.error('Tool yüklenemedi:', error)
    notFound()
  }

  // Pozisyonlara göre reklam alanlarını grupla
  const adSlotsByPosition = {
    TOP: adSlots.filter((slot) => slot.position === 'TOP'),
    MIDDLE: adSlots.filter((slot) => slot.position === 'MIDDLE'),
    BOTTOM: adSlots.filter((slot) => slot.position === 'BOTTOM'),
    SIDEBAR_LEFT: adSlots.filter((slot) => slot.position === 'SIDEBAR_LEFT'),
    SIDEBAR_RIGHT: adSlots.filter((slot) => slot.position === 'SIDEBAR_RIGHT'),
    INLINE: adSlots.filter((slot) => slot.position === 'INLINE'),
  }

  return (
    <ToolPageClient
      tool={tool}
      toolData={toolData}
      adSlotsByPosition={adSlotsByPosition}
    />
  )
}

