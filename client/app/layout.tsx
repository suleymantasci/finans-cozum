import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://finanscozum.com"),
  title: {
    default: "Finanscözüm | Finans Hesaplama Araçları ve Canlı Piyasa Verileri",
    template: "%s | Finanscözüm",
  },
  description:
    "Kredi hesaplama, döviz çevirici, mevduat hesaplama ve daha fazlası. Canlı döviz kurları, kripto fiyatları ve borsa verileriyle finansal kararlarınızı kolaylaştırın.",
  keywords: [
    "kredi hesaplama",
    "döviz çevirici",
    "mevduat hesaplama",
    "canlı döviz kurları",
    "bitcoin fiyatı",
    "borsa",
    "finans araçları",
    "faiz hesaplama",
  ],
  authors: [{ name: "Finanscözüm" }],
  creator: "Finanscözüm",
  publisher: "Finanscözüm",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://finanscozum.com",
    title: "Finanscözüm | Finans Hesaplama Araçları ve Canlı Piyasa Verileri",
    description:
      "Kredi hesaplama, döviz çevirici, mevduat hesaplama ve daha fazlası. Canlı piyasa verileriyle finansal kararlarınızı kolaylaştırın.",
    siteName: "Finanscözüm",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finanscözüm | Finans Hesaplama Araçları",
    description: "Kredi hesaplama, döviz çevirici ve canlı piyasa verileri",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
