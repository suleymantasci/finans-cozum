import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://finanscozum.com"

  const staticPages = [
    "",
    "/araclar",
    "/araclar/kredi-hesaplama",
    "/araclar/doviz-cevirici",
    "/araclar/vade-hesaplama",
    "/araclar/mevduat-hesaplama",
    "/araclar/kredi-karti-borc",
    "/araclar/faiz-hesaplama",
    "/piyasalar",
    "/haberler",
    "/giris",
    "/kayit",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : route.includes("/araclar") ? 0.9 : 0.8,
  }))

  return staticPages
}
