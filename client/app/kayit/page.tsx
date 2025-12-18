import { RegisterForm } from "@/components/auth/register-form"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Kayıt Ol | Finanscözüm",
  description: "Finanscözüm'e ücretsiz kayıt olun ve tüm finans araçlarına sınırsız erişim kazanın.",
}

export default function RegisterPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Hesap Oluştur</h1>
          <p className="text-(--color-foreground-muted)">Ücretsiz hesap oluşturun ve tüm özelliklere erişin</p>
        </div>

        <RegisterForm />

        <div className="text-center text-sm">
          <span className="text-(--color-foreground-muted)">Zaten hesabınız var mı? </span>
          <Link href="/giris" className="font-semibold text-(--color-primary) hover:underline">
            Giriş Yapın
          </Link>
        </div>
      </div>
    </div>
  )
}
