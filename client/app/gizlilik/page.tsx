import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Finanscözüm gizlilik politikası. Kişisel verilerinizin korunması ve kullanımı hakkında bilgiler",
}

export default function GizlilikPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Gizlilik Politikası</h1>
          <p className="mx-auto max-w-2xl text-lg text-(--color-foreground-muted)">
            Son güncelleme: {new Date().toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Genel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Finanscözüm olarak, kullanıcılarımızın gizliliğine büyük önem veriyoruz. Bu gizlilik politikası,
                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve ilgili mevzuat kapsamında, hangi
                kişisel verileri topladığımız, bu verileri nasıl kullandığımız ve koruduğumuz hakkında sizleri
                bilgilendirmek amacıyla hazırlanmıştır.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Toplanan Kişisel Veriler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>Platformumuzu kullanırken topladığımız kişisel veriler şunları içerebilir:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Kimlik Bilgileri:</strong> Ad, soyad, e-posta adresi (hesap oluşturduğunuzda)
                </li>
                <li>
                  <strong>Kullanım Verileri:</strong> Ziyaret ettiğiniz sayfalar, kullandığınız özellikler,
                  IP adresi, tarayıcı bilgileri
                </li>
                <li>
                  <strong>Çerezler:</strong> Web sitemizde deneyiminizi iyileştirmek için çerezler
                  kullanılmaktadır
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Kişisel Verilerin Kullanım Amacı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>Topladığımız kişisel verileri aşağıdaki amaçlarla kullanmaktayız:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Hizmetlerimizi sunmak ve geliştirmek</li>
                <li>Kullanıcı hesaplarını yönetmek</li>
                <li>Favori listelerinizi saklamak</li>
                <li>Platform güvenliğini sağlamak</li>
                <li>Yasal yükümlülüklerimizi yerine getirmek</li>
                <li>İstatistiksel analizler yapmak (anonimleştirilmiş verilerle)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Kişisel Verilerin Paylaşılması</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Kişisel verileriniz, yasal yükümlülükler ve hizmet kalitesi gerektirdiği durumlar dışında üçüncü
                şahıslarla paylaşılmamaktadır. Verileriniz yalnızca:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Yasal yükümlülükler kapsamında yetkili kurumlarla</li>
                <li>Hizmet sağlayıcılarımızla (ör. hosting, analytics) - sadece gerekli olduğu ölçüde</li>
                <li>Açık rızanız ile belirttiğiniz amaçlar doğrultusunda paylaşılabilir</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Çerezler (Cookies)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Web sitemizde kullanıcı deneyimini iyileştirmek ve site trafiğini analiz etmek için çerezler
                kullanıyoruz. Çerezler, tarayıcınız tarafından saklanan küçük metin dosyalarıdır. Çerez
                kullanımını tarayıcı ayarlarınızdan kontrol edebilirsiniz.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Veri Güvenliği</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Kişisel verilerinizin güvenliği için teknik ve idari tedbirler almaktayız. Verileriniz güvenli
                sunucularda saklanmakta ve şifrelenmiş bağlantılar (HTTPS) üzerinden iletilmektedir. Ancak,
                internet üzerinden yapılan hiçbir veri aktarımı %100 güvenli olmadığından, bu konuda mutlak
                garanti veremeyiz.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. KVKK Kapsamındaki Haklarınız</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                <li>Silinmesini veya yok edilmesini isteme</li>
                <li>Düzeltme, silme ve yok etme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere
                  bildirilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi suretiyle aleyhinize
                  sonuç doğurmasına itiraz etme</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. İletişim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Gizlilik politikamız hakkında sorularınız veya KVKK kapsamındaki haklarınızı kullanmak
                istiyorsanız, lütfen bizimle iletişime geçin:
              </p>
              <p className="font-medium">E-posta: info@finanscozum.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Değişiklikler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-(--color-foreground-muted)">
              <p>
                Bu gizlilik politikası, yasal düzenlemelerdeki değişiklikler veya hizmetlerimizdeki
                güncellemeler nedeniyle zaman zaman değiştirilebilir. Önemli değişiklikler platformumuz üzerinden
                duyurulacaktır. Bu sayfayı düzenli olarak kontrol etmenizi öneririz.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

