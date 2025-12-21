/**
 * Türkçe karakterleri İngilizce karşılıklarına çevirir
 */
function turkishToEnglish(text: string): string {
  const turkishChars: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
  };

  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, (char) => turkishChars[char] || char);
}

/**
 * Metni slug formatına çevirir
 * Örnek: "Bursa'daki Yangın Bölgesinde Feci Kaza: 3 Can Kaybı" 
 * -> "bursadaki-yangin-bolgesinde-feci-kaza-3-can-kaybi"
 */
export function generateSlug(text: string): string {
  return turkishToEnglish(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Özel karakterleri kaldır
    .replace(/[\s_-]+/g, '-') // Boşlukları ve alt çizgileri tire ile değiştir
    .replace(/^-+|-+$/g, ''); // Başta ve sonda kalan tireleri kaldır
}

/**
 * Benzersiz slug oluşturur
 * Eğer slug zaten varsa, sonuna sayı ekler (örn: slug-1, slug-2)
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>,
  maxAttempts: number = 100
): Promise<string> {
  let slug = baseSlug;
  let attempt = 0;

  while (await checkExists(slug) && attempt < maxAttempts) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  if (attempt >= maxAttempts) {
    // Son çare: timestamp ekle
    slug = `${baseSlug}-${Date.now()}`;
  }

  return slug;
}


