import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { generateSlug, generateUniqueSlug } from '../common/utils/slug.util';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // Admin kullanıcı bul veya oluştur
  let admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@finanscozum.com',
        password: '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', // admin123
        name: 'Admin',
        role: 'ADMIN',
      },
    });
  }

  // Kategorileri al
  const ekonomiCategory = await prisma.category.findUnique({ where: { slug: 'ekonomi' } });
  const piyasalarCategory = await prisma.category.findUnique({ where: { slug: 'piyasalar' } });
  const kriptoCategory = await prisma.category.findUnique({ where: { slug: 'kripto' } });

  if (!ekonomiCategory || !piyasalarCategory || !kriptoCategory) {
    throw new Error('Kategoriler bulunamadı. Önce migration çalıştırın.');
  }

  // 3 dummy haber oluştur
  const newsData = [
    {
      title: 'Merkez Bankası Faiz Kararı Açıklandı',
      excerpt: 'TCMB, politika faizini yüzde 50 seviyesinde sabit tutma kararı aldı. Piyasalar bu karara olumlu tepki verdi.',
      content: `
        <h2>Türkiye Cumhuriyet Merkez Bankası Para Politikası Kurulu Kararı</h2>
        <p>Türkiye Cumhuriyet Merkez Bankası (TCMB) Para Politikası Kurulu, politika faizini yüzde 50 seviyesinde sabit tutma kararı aldı.</p>
        <p>Karar, piyasa beklentileriyle uyumlu olarak değerlendirildi. Uzmanlar, enflasyon hedeflerine ulaşmak için bu kararın doğru olduğunu belirtti.</p>
        <h3>Piyasa Tepkileri</h3>
        <p>Borsa İstanbul, karar sonrası yükselişe geçti. Döviz kurlarında ise istikrar gözleniyor.</p>
        <img src="/uploads/images/placeholder.jpg" alt="TCMB Binası" />
      `,
      categoryId: ekonomiCategory.id,
      status: 'PUBLISHED' as any,
      featuredImage: '/uploads/images/placeholder.jpg',
      tags: ['Merkez Bankası', 'Faiz', 'TCMB', 'Ekonomi'],
      metaTitle: 'Merkez Bankası Faiz Kararı Açıklandı | Finanscözüm',
      metaDescription: 'TCMB politika faizini yüzde 50 seviyesinde sabit tuttu. Piyasa tepkileri ve uzman yorumları.',
      publishedAt: new Date(),
    },
    {
      title: 'Dolar ve Euro Kurunda Son Durum',
      excerpt: 'Döviz piyasalarında hareketlilik devam ediyor. Dolar 34.25, Euro ise 37.82 seviyesinde işlem görüyor.',
      content: `
        <h2>Döviz Piyasalarında Güncel Durum</h2>
        <p>Döviz piyasalarında bugün hareketli bir seans yaşandı. Amerikan Doları (USD) 34.25 TL seviyesinde işlem görürken, Euro (EUR) 37.82 TL seviyesinde kapanış yaptı.</p>
        <h3>Günlük Değişim</h3>
        <ul>
          <li>USD/TRY: 34.25 (+0.12%)</li>
          <li>EUR/TRY: 37.82 (+0.08%)</li>
          <li>GBP/TRY: 43.15 (-0.05%)</li>
        </ul>
        <p>Uzmanlar, küresel piyasalardaki gelişmelerin Türk Lirası üzerindeki etkisini değerlendiriyor.</p>
        <img src="/uploads/images/placeholder.jpg" alt="Döviz Kurları" />
      `,
      categoryId: piyasalarCategory.id,
      status: 'PUBLISHED' as any,
      featuredImage: '/uploads/images/placeholder.jpg',
      tags: ['Döviz', 'USD', 'EUR', 'Kur'],
      metaTitle: 'Dolar ve Euro Kurunda Son Durum | Finanscözüm',
      metaDescription: 'Güncel döviz kurları ve piyasa analizi. USD, EUR ve diğer para birimlerinde son durum.',
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 saat önce
    },
    {
      title: 'Kripto Para Piyasasında Yükseliş',
      excerpt: 'Bitcoin 95 bin doları aşarken, altcoinlerde de hareketlilik gözleniyor. Ethereum %2.18 artış gösterdi.',
      content: `
        <h2>Kripto Para Piyasası Güncel Durum</h2>
        <p>Kripto para piyasasında bugün yükseliş trendi devam ediyor. Bitcoin (BTC) 95,240 dolar seviyesini aşarken, Ethereum (ETH) %2.18 değer kazandı.</p>
        <h3>Öne Çıkan Kripto Paralar</h3>
        <ul>
          <li>Bitcoin (BTC): $95,240 (+2.18%)</li>
          <li>Ethereum (ETH): $3,245 (+1.85%)</li>
          <li>Binance Coin (BNB): $625 (+0.95%)</li>
        </ul>
        <p>Uzmanlar, kurumsal yatırımcıların artan ilgisinin piyasayı desteklediğini belirtiyor.</p>
        <video src="/uploads/videos/placeholder.mp4" controls></video>
        <p>Kripto para piyasalarındaki son gelişmeler ve analizler için takipte kalın.</p>
      `,
      categoryId: kriptoCategory.id,
      status: 'PUBLISHED' as any,
      featuredImage: '/uploads/images/placeholder.jpg',
      tags: ['Bitcoin', 'Kripto', 'Ethereum', 'Blockchain'],
      metaTitle: 'Kripto Para Piyasasında Yükseliş | Finanscözüm',
      metaDescription: 'Bitcoin 95 bin doları aştı. Ethereum ve diğer altcoinlerde yükseliş trendi devam ediyor.',
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 saat önce
    },
  ];

  for (const newsItem of newsData) {
    // Slug oluştur
    const baseSlug = generateSlug(newsItem.title);
    const slug = await generateUniqueSlug(
      baseSlug,
      async (slug) => {
        const existing = await prisma.news.findUnique({
          where: { slug },
        });
        return !!existing;
      }
    );

    await prisma.news.create({
      data: {
        title: newsItem.title,
        excerpt: newsItem.excerpt,
        content: newsItem.content,
        categoryId: newsItem.categoryId,
        status: newsItem.status,
        featuredImage: newsItem.featuredImage,
        tags: newsItem.tags,
        metaTitle: newsItem.metaTitle,
        metaDescription: newsItem.metaDescription,
        publishedAt: newsItem.publishedAt,
        slug,
        authorId: admin.id,
      },
    });
  }

  console.log('✅ 3 dummy haber başarıyla oluşturuldu!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

