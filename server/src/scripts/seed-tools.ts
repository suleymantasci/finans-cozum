import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🚀 Araçlar seed işlemi başlatılıyor...');

  // Tool kategorilerini oluştur
  const categories = [
    { name: 'Kredi', slug: 'kredi', description: 'Kredi hesaplama araçları', order: 1 },
    { name: 'Yatırım', slug: 'yatirim', description: 'Yatırım hesaplama araçları', order: 2 },
    { name: 'Döviz', slug: 'doviz', description: 'Döviz çevirici araçları', order: 3 },
  ];

  const createdCategories: Record<string, any> = {};

  for (const cat of categories) {
    const existing = await prisma.toolCategory.findUnique({ where: { slug: cat.slug } });
    if (!existing) {
      const created = await prisma.toolCategory.create({ data: cat });
      createdCategories[cat.slug] = created;
      console.log(`✅ Kategori oluşturuldu: ${cat.name}`);
    } else {
      createdCategories[cat.slug] = existing;
      console.log(`ℹ️  Kategori zaten mevcut: ${cat.name}`);
    }
  }

  // Araçları oluştur
  const tools = [
    {
      name: 'Kredi Hesaplama',
      slug: 'kredi-hesaplama',
      description: 'İhtiyaç, konut ve taşıt kredisi hesaplayın, aylık taksitlerinizi öğrenin',
      component: 'LoanCalculator',
      icon: 'Calculator',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      order: 1,
      status: 'PUBLISHED',
      isFeatured: true,
      dataSourceType: 'STATIC',
      categorySlug: 'kredi',
      keywords: ['kredi', 'taksit', 'hesaplama', 'konut kredisi', 'ihtiyaç kredisi', 'taşıt kredisi'],
      config: {
        defaultValues: {
          principal: 100000,
          rate: 12,
          months: 36,
        },
        validation: {
          principal: { min: 1000, max: 10000000 },
          rate: { min: 0.1, max: 100 },
          months: { min: 1, max: 120 },
        },
      },
      metaTitle: 'Kredi Hesaplama | Finanscözüm',
      metaDescription: 'İhtiyaç, konut ve taşıt kredisi hesaplama aracı. Aylık taksit tutarını, toplam ödeme ve faiz maliyetini öğrenin.',
    },
    {
      name: 'Vade Hesaplama',
      slug: 'vade-hesaplama',
      description: 'Yatırımlarınızın vade sonunda kazancını hesaplayın',
      component: 'VadeCalculator',
      icon: 'Calendar',
      color: '#10b981',
      bgColor: '#d1fae5',
      order: 2,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'yatirim',
      keywords: ['vade', 'yatırım', 'getiri', 'hesaplama'],
      config: {
        defaultValues: {
          principal: 100000,
          rate: 10,
          target: 150000,
        },
      },
      metaTitle: 'Vade Hesaplama | Finanscözüm',
      metaDescription: 'Yatırımlarınızın vade sonunda kazancını hesaplayın. Hedef tutara ulaşmak için gereken vadeyi öğrenin.',
    },
    {
      name: 'Döviz Çevirici',
      slug: 'doviz-cevirici',
      description: 'Anlık kurlarla döviz ve kripto para çevirisi yapın',
      component: 'CurrencyConverter',
      icon: 'DollarSign',
      color: '#10b981',
      bgColor: '#d1fae5',
      order: 3,
      status: 'PUBLISHED',
      isFeatured: true,
      dataSourceType: 'EXTERNAL_API',
      categorySlug: 'doviz',
      keywords: ['döviz', 'kur', 'çevirici', 'dolar', 'euro', 'sterlin', 'kripto'],
      config: {
        defaultValues: {
          from: 'USD',
          to: 'TRY',
          amount: 100,
        },
      },
      metaTitle: 'Döviz Çevirici | Finanscözüm',
      metaDescription: 'Anlık döviz kurları ile para birimi çevirisi yapın. USD, EUR, GBP ve daha fazlası.',
    },
    {
      name: 'Mevduat Hesaplama',
      slug: 'mevduat-hesaplama',
      description: 'Mevduat hesabınızın getirisini ve faiz kazancını hesaplayın',
      component: 'DepositCalculator',
      icon: 'PiggyBank',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      order: 4,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'yatirim',
      keywords: ['mevduat', 'faiz', 'getiri', 'hesaplama', 'tasarruf'],
      config: {
        defaultValues: {
          amount: 100000,
          rate: 20,
          months: 12,
        },
      },
      metaTitle: 'Mevduat Hesaplama | Finanscözüm',
      metaDescription: 'Mevduat hesabınızın getirisini ve faiz kazancını hesaplayın. Vade sonu tutarını öğrenin.',
    },
    {
      name: 'Kredi Kartı Borç Hesaplama',
      slug: 'kredi-karti-borc',
      description: 'Kredi kartı borcunuzun taksit planını oluşturun',
      component: 'CreditCardDebtCalculator',
      icon: 'CreditCard',
      color: '#ef4444',
      bgColor: '#fee2e2',
      order: 5,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'kredi',
      keywords: ['kredi kartı', 'borç', 'taksit', 'hesaplama', 'ödeme planı'],
      config: {
        defaultValues: {
          debt: 10000,
          rate: 2.5,
          monthlyPayment: 500,
        },
      },
      metaTitle: 'Kredi Kartı Borç Hesaplama | Finanscözüm',
      metaDescription: 'Kredi kartı borcunuzun taksit planını oluşturun. Ödeme süresi ve toplam faizi öğrenin.',
    },
    {
      name: 'Faiz Hesaplama',
      slug: 'faiz-hesaplama',
      description: 'Basit ve bileşik faiz hesaplamaları yapın',
      component: 'InterestCalculator',
      icon: 'Percent',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      order: 6,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'yatirim',
      keywords: ['faiz', 'basit faiz', 'bileşik faiz', 'hesaplama'],
      config: {
        defaultValues: {
          principal: 100000,
          rate: 10,
          time: 12,
        },
      },
      metaTitle: 'Faiz Hesaplama | Finanscözüm',
      metaDescription: 'Basit ve bileşik faiz hesaplamaları yapın. Faiz kazancınızı hesaplayın.',
    },
  ];

  for (const toolData of tools) {
    const existing = await prisma.tool.findUnique({ where: { slug: toolData.slug } });
    
    if (existing) {
      console.log(`ℹ️  Araç zaten mevcut: ${toolData.name}`);
      continue;
    }

    const category = createdCategories[toolData.categorySlug];
    if (!category) {
      console.error(`❌ Kategori bulunamadı: ${toolData.categorySlug}`);
      continue;
    }

    const tool = await prisma.tool.create({
      data: {
        name: toolData.name,
        slug: toolData.slug,
        description: toolData.description,
        component: toolData.component,
        icon: toolData.icon,
        color: toolData.color,
        bgColor: toolData.bgColor,
        order: toolData.order,
        status: toolData.status as any,
        isFeatured: toolData.isFeatured,
        dataSourceType: toolData.dataSourceType as any,
        config: toolData.config,
        keywords: toolData.keywords,
        metaTitle: toolData.metaTitle,
        metaDescription: toolData.metaDescription,
        categoryId: category.id,
        views: 0,
      },
    });

    console.log(`✅ Araç oluşturuldu: ${tool.name} (${tool.slug})`);
  }

  console.log('✨ Araçlar seed işlemi tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });


