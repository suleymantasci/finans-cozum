import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Target, Users, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Finanscözüm hakkında bilgiler, misyonumuz, vizyonumuz ve değerlerimiz",
}

export default function HakkimizdaPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Hakkımızda</h1>
        <p className="mx-auto max-w-2xl text-lg text-(--color-foreground-muted)">
          Finansal kararlarınızı kolaylaştıran, güvenilir ve kullanıcı dostu bir platform
        </p>
      </div>

      {/* Misyon Vizyon */}
      <div className="mb-12 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-primary)/10">
              <Target className="h-6 w-6 text-(--color-primary)" />
            </div>
            <CardTitle>Misyonumuz</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-(--color-foreground-muted)">
              Finanscözüm olarak, herkesin finansal kararlarını bilinçli ve kolay bir şekilde alabilmesi için
              güvenilir, kullanıcı dostu ve kapsamlı finans araçları sunmayı hedefliyoruz. Teknolojiyi kullanarak
              finansal bilgiye erişimi demokratikleştiriyoruz.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-primary)/10">
              <TrendingUp className="h-6 w-6 text-(--color-primary)" />
            </div>
            <CardTitle>Vizyonumuz</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-(--color-foreground-muted)">
              Türkiye'nin en güvenilir ve kapsamlı finans platformu olmak. Kullanıcılarımıza her zaman en güncel
              piyasa verileri, en doğru hesaplama araçları ve en kullanışlı finansal çözümleri sunmak için
              sürekli gelişiyoruz.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Değerlerimiz */}
      <div className="mb-12">
        <h2 className="mb-8 text-center text-3xl font-bold">Değerlerimiz</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-primary)/10">
                <Zap className="h-6 w-6 text-(--color-primary)" />
              </div>
              <CardTitle className="text-lg">Hızlı ve Doğru</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-(--color-foreground-muted)">
                Anlık piyasa verileri ve hızlı hesaplamalarla zamanınızı değerli tutuyoruz.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-primary)/10">
                <Users className="h-6 w-6 text-(--color-primary)" />
              </div>
              <CardTitle className="text-lg">Kullanıcı Odaklı</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-(--color-foreground-muted)">
                Kullanıcı deneyimini ön planda tutarak, herkesin kolayca kullanabileceği bir platform sunuyoruz.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-primary)/10">
                <TrendingUp className="h-6 w-6 text-(--color-primary)" />
              </div>
              <CardTitle className="text-lg">Güvenilir</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-(--color-foreground-muted)">
                Doğruluğu kanıtlanmış veriler ve hesaplamalarla güvenilir sonuçlar sunuyoruz.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-primary)/10">
                <Target className="h-6 w-6 text-(--color-primary)" />
              </div>
              <CardTitle className="text-lg">Sürekli Gelişim</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-(--color-foreground-muted)">
                Teknoloji ve kullanıcı ihtiyaçlarına göre sürekli gelişiyor ve yenileniyoruz.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hizmetlerimiz */}
      <Card>
        <CardHeader>
          <CardTitle>Hizmetlerimiz</CardTitle>
          <CardDescription>Size sunduğumuz kapsamlı finans çözümleri</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-(--color-foreground-muted)">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-(--color-primary)">•</span>
              <span>
                <strong className="text-(--color-foreground)">Finans Hesaplama Araçları:</strong> Kredi, mevduat,
                faiz ve vade hesaplama gibi günlük finansal ihtiyaçlarınız için kapsamlı araçlar
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-(--color-primary)">•</span>
              <span>
                <strong className="text-(--color-foreground)">Canlı Piyasa Verileri:</strong> Döviz, kripto para,
                hisse senedi ve emtia fiyatlarını anlık takip etme imkanı
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-(--color-primary)">•</span>
              <span>
                <strong className="text-(--color-foreground)">Finansal Haberler:</strong> Güncel ekonomi ve finans
                haberleriyle bilgili kararlar alın
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-(--color-primary)">•</span>
              <span>
                <strong className="text-(--color-foreground)">Bankalar ve Mevduat:</strong> En iyi mevduat
                faizlerini karşılaştırın ve seçiminizi yapın
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

