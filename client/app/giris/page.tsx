import { LoginForm } from "@/components/auth/login-form"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Giriş Yap | Finanscözüm",
  description: "Finanscözüm hesabınıza giriş yapın ve tüm finans araçlarına erişin.",
}

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Hoş Geldiniz</h1>
          <p className="text-(--color-foreground-muted)">Hesabınıza giriş yapın ve finansal araçlara erişin</p>
        </div>

        <LoginForm />

        <div className="text-center text-sm">
          <span className="text-(--color-foreground-muted)">Hesabınız yok mu? </span>
          <Link href="/kayit" className="font-semibold text-(--color-primary) hover:underline">
            Kayıt Olun
          </Link>
        </div>
      </div>
    </div>
  )
}
