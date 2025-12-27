"use client"

import Link from "next/link"
import { Calculator, Newspaper, TrendingUp, Menu, Moon, Sun, Calendar, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { theme, setTheme } = useTheme()
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const { user, isAuthenticated, logout, loading } = useAuth()

  const navigation = [
    { name: "Araçlar", href: "/araclar", icon: Calculator },
    { name: "Piyasalar", href: "/piyasalar", icon: TrendingUp },
    { name: "Haberler", href: "/haberler", icon: Newspaper },
  ]

  const calendars = [
    { name: "Ekonomik Takvim", href: "/ekonomik-takvim" },
    { name: "Halka Arz Takvimi", href: "/halka-arz-takvimi" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-(--color-background)/95 backdrop-blur supports-[backdrop-filter]:bg-(--color-background)/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--color-primary) text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">Finanscözüm</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-2 text-sm font-medium text-(--color-foreground-muted) transition-colors hover:text-(--color-primary)"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}

          <div
            className="relative"
            onMouseEnter={() => setIsCalendarOpen(true)}
            onMouseLeave={() => setIsCalendarOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm font-medium text-(--color-foreground-muted) transition-colors hover:text-(--color-primary)">
              <Calendar className="h-4 w-4" />
              Takvimler
            </button>
            {isCalendarOpen && (
              <div className="absolute left-0 top-full w-48 pt-2">
                <div className="rounded-lg border bg-(--color-card) shadow-lg">
                  {calendars.map((calendar) => (
                    <Link
                      key={calendar.name}
                      href={calendar.href}
                      className="block px-4 py-2.5 text-sm transition-colors hover:bg-(--color-accent) first:rounded-t-lg last:rounded-b-lg"
                    >
                      {calendar.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden md:flex"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Tema Değiştir</span>
          </Button>

          {!loading && (
            <>
              {!isAuthenticated ? (
                <Button asChild variant="ghost" className="hidden md:flex">
                  <Link href="/giris">Giriş Yap</Link>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hidden md:flex">
                      <User className="mr-2 h-4 w-4" />
                      {user?.name || user?.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profil" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'ADMIN' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Çıkış Yap
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menü</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0">
              <div className="flex h-full flex-col px-6 py-8">
                {/* Logo */}
                <Link href="/" className="mb-8 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--color-primary) text-white">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-xl font-bold">Finanscözüm</span>
                </Link>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-(--color-accent)"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}

                  <div className="pt-4">
                    <div className="mb-2 flex items-center gap-2 px-3 text-sm font-semibold text-(--color-foreground-muted)">
                      <Calendar className="h-4 w-4" />
                      Takvimler
                    </div>
                    <div className="space-y-1 pl-3">
                      {calendars.map((calendar) => (
                        <Link
                          key={calendar.name}
                          href={calendar.href}
                          className="block rounded-lg px-3 py-2.5 text-sm font-medium text-(--color-foreground-muted) transition-colors hover:bg-(--color-accent) hover:text-(--color-foreground)"
                        >
                          {calendar.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </nav>

                {/* Bottom Actions */}
                <div className="space-y-3 border-t pt-6">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 bg-transparent"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="ml-6">{theme === "dark" ? "Açık Tema" : "Koyu Tema"}</span>
                  </Button>

                  {!isAuthenticated ? (
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/giris">Giriş Yap</Link>
                    </Button>
                  ) : (
                    <>
                      <Button asChild className="w-full">
                        <Link href="/profil">
                          <User className="mr-2 h-4 w-4" />
                          Profil
                        </Link>
                      </Button>
                      {user?.role === 'ADMIN' && (
                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <Link href="/admin">Admin Panel</Link>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="w-full bg-transparent text-red-600"
                        onClick={logout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Çıkış Yap
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
