import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description: "Finanscözüm kullanım koşulları. Platform kullanımı ve hizmetlerimiz hakkında şartlar ve koşullar",
}

export default function KosullarPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Kullanım Koşulları</h1>
          <p className="mx-auto max-w-2xl text-lg text-(--color-foreground-muted)">
            Son güncelleme: {new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Genel Hükümler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Bu kullanım koşulları, Finanscözüm web sitesi ve mobil uygulaması ("Platform") üzerinden
                sunulan hizmetlerin kullanımını düzenler. Platformu kullanarak, bu koşulları kabul etmiş
                sayılırsınız. Eğer bu koşulları kabul etmiyorsanız, lütfen platformu kullanmayın.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Hizmet Tanımı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Finanscözüm, finansal hesaplama araçları, canlı piyasa verileri, finansal haberler ve benzeri
                finansal bilgiler sunan bir platformdur. Platform üzerinden sunulan tüm hizmetler bilgilendirme
                amaçlıdır ve yatırım tavsiyesi niteliği taşımamaktadır.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Kullanım Kuralları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>Platformu kullanırken aşağıdaki kurallara uymanız gerekmektedir:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Platformu yalnızca yasal amaçlarla kullanmalısınız</li>
                <li>Platformun işleyişini bozacak, zarar verecek veya erişimi engelleyecek faaliyetlerde bulunmamalısınız</li>
                <li>Başkalarının hesaplarına yetkisiz erişim sağlamamalısınız</li>
                <li>Platform üzerinden zararlı yazılım, virüs veya kötü amaçlı kod yüklememelisiniz</li>
                <li>Telif hakkı, marka veya diğer fikri mülkiyet haklarını ihlal etmemelisiniz</li>
                <li>Yanlış, yanıltıcı veya sahte bilgi paylaşmamalısınız</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Hesaplar ve Güvenlik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Bazı özelliklerimizi kullanmak için hesap oluşturmanız gerekebilir. Hesap oluştururken:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Doğru, güncel ve eksiksiz bilgiler sağlamalısınız</li>
                <li>Hesap bilgilerinizin gizliliğini ve güvenliğini sağlamaktan siz sorumlusunuz</li>
                <li>Hesabınızın yetkisiz kullanımından derhal haberimiz olursa, hesabınızı askıya alma veya
                  kapatma hakkımız saklıdır</li>
                <li>Hesabınızın güvenliğinden siz sorumlusunuz</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Fikri Mülkiyet Hakları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Platform üzerindeki tüm içerikler (metin, grafik, logo, ikonlar, görseller, yazılım vb.) Finanscözüm
                veya lisans sahiplerinin mülkiyetindedir ve telif hakkı, marka ve diğer fikri mülkiyet yasaları ile
                korunmaktadır. Platform içeriğini izin almadan kopyalayamaz, dağıtamaz veya ticari amaçlarla
                kullanamazsınız.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Sorumluluk Reddi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Platform üzerinden sunulan bilgiler genel bilgilendirme amaçlıdır ve yatırım tavsiyesi
                niteliği taşımaz. Finansal kararlarınızı vermeden önce uzman danışmanlık almanızı öneririz.
              </p>
              <p>
                Platformda sunulan veriler ve hesaplamalar makul özen gösterilerek hazırlanmış olsa da,
                kesin doğruluğu garanti edilmez. Platformun kesintisiz veya hatasız çalışacağı garanti
                edilmemektedir.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Üçüncü Taraf Bağlantılar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Platformumuz üzerinde üçüncü taraf web sitelerine bağlantılar bulunabilir. Bu bağlantılar
                yalnızca kolaylık sağlamak amacıyla sunulmaktadır. Üçüncü taraf sitelerin içeriği, gizlilik
                politikaları veya uygulamaları üzerinde kontrolümüz bulunmamaktadır. Bu siteleri ziyaret
                ettiğinizde kendi sorumluluğunuzdadır.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Hizmet Değişiklikleri ve Kesintiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Platformu veya sunulan hizmetleri önceden haber vermeksizin değiştirme, askıya alma veya
                sonlandırma hakkını saklı tutuyoruz. Platform bakım, güncelleme veya teknik sorunlar nedeniyle
                geçici olarak erişilemez duruma gelebilir.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Fesih</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Bu kullanım koşullarını ihlal etmeniz durumunda, önceden haber vermeksizin hesabınızı askıya
                alma veya kapatma ve platforma erişiminizi engelleme hakkımız saklıdır.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Değişiklikler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Bu kullanım koşullarını zaman zaman güncelleyebiliriz. Önemli değişiklikler platformumuz
                üzerinden duyurulacaktır. Değişikliklerden sonra platformu kullanmaya devam etmeniz, güncellenmiş
                koşulları kabul ettiğiniz anlamına gelir.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Uygulanacak Hukuk ve Yetki</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Bu kullanım koşulları Türkiye Cumhuriyeti yasalarına tabidir. Bu koşullardan kaynaklanan
                uyuşmazlıkların çözümünde Türkiye Cumhuriyeti yasaları uygulanır.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. İletişim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Bu kullanım koşulları hakkında sorularınız varsa, lütfen bizimle iletişime geçin:
              </p>
              <p className="font-medium">E-posta: info@finanscozum.com</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

