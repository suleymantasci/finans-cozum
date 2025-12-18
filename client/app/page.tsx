import { HeroSection } from "@/components/sections/hero-section"
import { LiveMarketTicker } from "@/components/sections/live-market-ticker"
import { FeaturedTools } from "@/components/sections/featured-tools"
import { MarketOverview } from "@/components/sections/market-overview"
import { LatestNews } from "@/components/sections/latest-news"
import { BankComparison } from "@/components/sections/bank-comparison"
import { CTASection } from "@/components/sections/cta-section"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <LiveMarketTicker />
      <HeroSection />
      <FeaturedTools />
      <MarketOverview />
      <LatestNews />
      <BankComparison />
      <CTASection />
    </div>
  )
}
