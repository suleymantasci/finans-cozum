import Link from "next/link"
import { TrendingUp } from "lucide-react"

export function Footer() {
  const footerLinks = {
    araçlar: [
      { name: "Kredi Hesaplama", href: "/araclar/kredi-hesaplama" },
      { name: "Vade Hesaplama", href: "/araclar/vade-hesaplama" },
      { name: "Döviz Çevirici", href: "/araclar/doviz-cevirici" },
      { name: "Mevduat Hesaplama", href: "/araclar/mevduat-hesaplama" },
    ],
    piyasalar: [
      { name: "Döviz Kurları", href: "/piyasalar/doviz" },
      { name: "Kripto Paralar", href: "/piyasalar/kripto" },
      { name: "Borsa", href: "/piyasalar/borsa" },
      { name: "Altın Fiyatları", href: "/piyasalar/altin" },
    ],
    kurumsal: [
      { name: "Hakkımızda", href: "/hakkimizda" },
      { name: "İletişim", href: "/iletisim" },
      { name: "Gizlilik Politikası", href: "/gizlilik" },
      { name: "Kullanım Koşulları", href: "/kosullar" },
    ],
  }

  return (
    <footer className="border-t bg-(--color-surface)">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--color-primary) text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">Finanscözüm</span>
            </Link>
            <p className="text-sm text-(--color-foreground-muted)">
              Türkiye'nin en kapsamlı finans araçları ve piyasa verileri platformu. Akıllı hesaplamalar ve güncel
              bilgilerle finansal kararlarınızı kolaylaştırın.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Araçlar</h3>
            <ul className="space-y-2">
              {footerLinks.araçlar.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-(--color-foreground-muted) hover:text-(--color-primary)"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Piyasalar</h3>
            <ul className="space-y-2">
              {footerLinks.piyasalar.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-(--color-foreground-muted) hover:text-(--color-primary)"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Kurumsal</h3>
            <ul className="space-y-2">
              {footerLinks.kurumsal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-(--color-foreground-muted) hover:text-(--color-primary)"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-(--color-foreground-muted)">
          <p>© {new Date().getFullYear()} Finanscözüm. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
