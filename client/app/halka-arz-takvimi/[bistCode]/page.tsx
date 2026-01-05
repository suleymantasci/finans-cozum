import type { Metadata } from "next"
import IpoDetailClientPage from "./ipoDetailClientPage"

type Props = {
  params: Promise<{ bistCode: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bistCode } = await params

  return {
    title: `${bistCode} Halka Arz Detayları | Finanscözüm`,
    description: `${bistCode} halka arz detayları, fiyat, tarih ve dağıtım bilgileri.`,
  }
}

export default async function IpoDetailPage({ params }: Props) {
  const { bistCode } = await params

  return <IpoDetailClientPage bistCode={bistCode} />
}
