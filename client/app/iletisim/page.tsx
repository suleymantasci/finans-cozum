import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MessageSquare, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "İletişim",
  description: "Finanscözüm ile iletişime geçin. Sorularınız, önerileriniz ve geri bildirimleriniz için bizimle iletişime geçebilirsiniz",
}

export default function IletisimPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">İletişim</h1>
        <p className="mx-auto max-w-2xl text-lg text-(--color-foreground-muted)">
          Sorularınız, önerileriniz ve geri bildirimleriniz için bizimle iletişime geçebilirsiniz
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* İletişim Bilgileri */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-primary)/10">
                <Mail className="h-6 w-6 text-(--color-primary)" />
              </div>
              <CardTitle>E-posta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-(--color-foreground-muted)">
                Genel sorularınız için:
              </p>
              <a
                href="mailto:info@finanscozum.com"
                className="mt-2 block text-lg font-semibold text-(--color-primary) hover:underline"
              >
                info@finanscozum.com
              </a>
              <p className="mt-4 text-sm text-(--color-foreground-muted)">
                Destek için:
              </p>
              <a
                href="mailto:destek@finanscozum.com"
                className="mt-2 block text-lg font-semibold text-(--color-primary) hover:underline"
              >
                destek@finanscozum.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-primary)/10">
                <MessageSquare className="h-6 w-6 text-(--color-primary)" />
              </div>
              <CardTitle>Geri Bildirim</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-(--color-foreground-muted)">
                Platformumuz hakkındaki görüşleriniz, önerileriniz veya hata bildirimleri için lütfen bizimle
                iletişime geçin. Her geri bildiriminiz bizim için değerlidir ve platformumuzu daha iyi hale
                getirmemize yardımcı olur.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-(--color-primary)/10">
                <Clock className="h-6 w-6 text-(--color-primary)" />
              </div>
              <CardTitle>Yanıt Süresi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-(--color-foreground-muted)">
                E-posta yoluyla gönderdiğiniz mesajlara en geç 48 saat içinde yanıt vermeye çalışıyoruz. Acil
                durumlar için lütfen konu satırında "ACİL" ibaresi kullanın.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* İletişim Formu Bilgisi */}
        <Card>
          <CardHeader>
            <CardTitle>Bizimle İletişime Geçin</CardTitle>
            <CardDescription>Mesajınızı aşağıdaki form ile bize iletebilirsiniz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium">
                  Adınız Soyadınız
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full rounded-md border px-4 py-2 focus:border-(--color-primary) focus:outline-none"
                  placeholder="Adınız ve soyadınız"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  E-posta Adresiniz
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full rounded-md border px-4 py-2 focus:border-(--color-primary) focus:outline-none"
                  placeholder="ornek@email.com"
                />
              </div>
              <div>
                <label htmlFor="subject" className="mb-2 block text-sm font-medium">
                  Konu
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full rounded-md border px-4 py-2 focus:border-(--color-primary) focus:outline-none"
                  placeholder="Mesajınızın konusu"
                />
              </div>
              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium">
                  Mesajınız
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full rounded-md border px-4 py-2 focus:border-(--color-primary) focus:outline-none"
                  placeholder="Mesajınızı buraya yazın..."
                />
              </div>
              <button className="w-full rounded-md bg-(--color-primary) px-4 py-2 font-medium text-white transition-colors hover:bg-(--color-primary)/90">
                Mesaj Gönder
              </button>
              <p className="text-xs text-(--color-foreground-muted)">
                Not: Form henüz aktif değildir. Lütfen yukarıdaki e-posta adreslerini kullanarak bizimle iletişime
                geçin.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

