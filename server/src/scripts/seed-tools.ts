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

  // Önce eski araçları sil
  console.log('🗑️  Eski araçlar siliniyor...');
  await prisma.tool.deleteMany({});
  console.log('✅ Eski araçlar silindi');

  // Tool kategorilerini oluştur/güncelle
  const categories = [
    { name: 'Faiz', slug: 'faiz', description: 'Faiz hesaplama araçları', order: 1 },
    { name: 'Kredi', slug: 'kredi', description: 'Kredi hesaplama araçları', order: 2 },
    { name: 'Yatırım', slug: 'yatirim', description: 'Yatırım hesaplama araçları', order: 3 },
    { name: 'İşletme', slug: 'isletme', description: 'İşletme finans hesaplama araçları', order: 4 },
    { name: 'Bütçe', slug: 'butce', description: 'Bütçe planlama araçları', order: 5 },
    { name: 'Döviz', slug: 'doviz', description: 'Döviz çevirici araçları', order: 6 },
  ];

  const createdCategories: Record<string, any> = {};

  for (const cat of categories) {
    const existing = await prisma.toolCategory.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      // Güncelle
      const updated = await prisma.toolCategory.update({
        where: { slug: cat.slug },
        data: cat,
      });
      createdCategories[cat.slug] = updated;
      console.log(`🔄 Kategori güncellendi: ${cat.name}`);
    } else {
      // Oluştur
      const created = await prisma.toolCategory.create({ data: cat });
      createdCategories[cat.slug] = created;
      console.log(`✅ Kategori oluşturuldu: ${cat.name}`);
    }
  }

  // Yeni araçları oluştur
  const tools = [
    // Faiz Hesaplamaları
    {
      name: 'Basit Faiz Hesaplama',
      slug: 'basit-faiz',
      description: 'Ana para üzerinden sabit faiz hesaplaması yapın',
      component: 'SimpleInterestCalculator',
      icon: 'Percent',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      order: 1,
      status: 'PUBLISHED',
      isFeatured: true,
      dataSourceType: 'STATIC',
      categorySlug: 'faiz',
      keywords: ['basit faiz', 'faiz', 'hesaplama', 'ana para'],
      config: {
        defaultValues: {
          principal: 100000,
          rate: 10,
          time: 1,
        },
      },
      metaTitle: 'Basit Faiz Hesaplama | Finanscözüm',
      metaDescription: 'Ana para üzerinden sabit faiz hesaplaması yapın. Basit faiz formülü ile faiz kazancınızı hesaplayın.',
    },
    {
      name: 'Bileşik Faiz Hesaplama',
      slug: 'bilesik-faiz',
      description: 'Faizin faize yatırıldığı durumlarda toplam getiri hesaplayın',
      component: 'CompoundInterestCalculator',
      icon: 'TrendingUp',
      color: '#10b981',
      bgColor: '#d1fae5',
      order: 2,
      status: 'PUBLISHED',
      isFeatured: true,
      dataSourceType: 'STATIC',
      categorySlug: 'faiz',
      keywords: ['bileşik faiz', 'faiz', 'hesaplama', 'getiri'],
      config: {
        defaultValues: {
          principal: 100000,
          rate: 10,
          time: 1,
        },
      },
      metaTitle: 'Bileşik Faiz Hesaplama | Finanscözüm',
      metaDescription: 'Faizin faize yatırıldığı durumlarda toplam getiri hesaplayın. Bileşik faiz formülü ile yatırım kazancınızı öğrenin.',
    },
    {
      name: 'Faiz Oranı Dönüştürme',
      slug: 'faiz-orani-donusturme',
      description: 'Yıllık, aylık ve günlük faiz oranlarını dönüştürün',
      component: 'InterestRateConverter',
      icon: 'Percent',
      color: '#6366f1',
      bgColor: '#e0e7ff',
      order: 3,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'faiz',
      keywords: ['faiz', 'dönüştürme', 'yıllık', 'aylık', 'günlük'],
      config: {
        defaultValues: {
          rate: 12,
        },
      },
      metaTitle: 'Faiz Oranı Dönüştürme | Finanscözüm',
      metaDescription: 'Yıllık, aylık ve günlük faiz oranlarını birbirine dönüştürün.',
    },

    // Kredi Hesaplamaları
    {
      name: 'Toplam Faiz Maliyeti Hesaplama',
      slug: 'toplam-faiz-maliyeti',
      description: 'Kredi için toplam faiz maliyetini hesaplayın',
      component: 'TotalInterestCostCalculator',
      icon: 'Receipt',
      color: '#ef4444',
      bgColor: '#fee2e2',
      order: 4,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'kredi',
      keywords: ['faiz maliyeti', 'kredi', 'toplam faiz'],
      config: {
        defaultValues: {
          principal: 100000,
          rate: 12,
          months: 36,
        },
      },
      metaTitle: 'Toplam Faiz Maliyeti Hesaplama | Finanscözüm',
      metaDescription: 'Kredi için toplam faiz maliyetini hesaplayın. Kredinin gerçek maliyetini öğrenin.',
    },
    {
      name: 'Aylık Taksit Hesaplama',
      slug: 'aylik-taksit',
      description: 'Kredi aylık taksit tutarını hesaplayın',
      component: 'MonthlyPaymentCalculator',
      icon: 'Calculator',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      order: 5,
      status: 'PUBLISHED',
      isFeatured: true,
      dataSourceType: 'STATIC',
      categorySlug: 'kredi',
      keywords: ['taksit', 'kredi', 'aylık ödeme', 'pmt'],
      config: {
        defaultValues: {
          principal: 100000,
          rate: 12,
          months: 36,
        },
      },
      metaTitle: 'Aylık Taksit Hesaplama | Finanscözüm',
      metaDescription: 'Kredi aylık taksit tutarını hesaplayın. PMT formülü ile doğru taksit tutarını öğrenin.',
    },
    {
      name: 'Amortisman Tablosu',
      slug: 'amortisman-tablosu',
      description: 'Kredi ödeme planı ve amortisman tablosunu görüntüleyin',
      component: 'AmortizationTableCalculator',
      icon: 'FileText',
      color: '#6366f1',
      bgColor: '#e0e7ff',
      order: 6,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'kredi',
      keywords: ['amortisman', 'kredi', 'ödeme planı', 'taksit tablosu'],
      config: {
        defaultValues: {
          principal: 100000,
          rate: 12,
          months: 36,
        },
      },
      metaTitle: 'Amortisman Tablosu | Finanscözüm',
      metaDescription: 'Kredi ödeme planı ve amortisman tablosunu görüntüleyin. Her ayın ödeme detaylarını öğrenin.',
    },
    {
      name: 'Ödeme Planı Çıktısı',
      slug: 'odeme-plani-ciktisi',
      description: 'Kredi için detaylı ödeme planı ve çizelgesi oluşturun',
      component: 'PaymentScheduleCalculator',
      icon: 'Receipt',
      color: '#6366f1',
      bgColor: '#e0e7ff',
      order: 7,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'kredi',
      keywords: ['ödeme planı', 'çizelge', 'kredi', 'detaylı plan'],
      config: {
        defaultValues: {
          principal: 100000,
          rate: 12,
          months: 36,
        },
      },
      metaTitle: 'Ödeme Planı Çıktısı | Finanscözüm',
      metaDescription: 'Kredi için detaylı ödeme planı ve çizelgesi oluşturun. Kümülatif ödeme bilgileri ile detaylı analiz yapın.',
    },

    // Yatırım Hesaplamaları
    {
      name: 'Yıllık Getiri Hesaplama',
      slug: 'yillik-getiri',
      description: 'Yatırımınızın toplam ve yıllık getiri oranını hesaplayın',
      component: 'AnnualReturnCalculator',
      icon: 'TrendingUp',
      color: '#10b981',
      bgColor: '#d1fae5',
      order: 8,
      status: 'PUBLISHED',
      isFeatured: true,
      dataSourceType: 'STATIC',
      categorySlug: 'yatirim',
      keywords: ['getiri', 'yatırım', 'yıllık getiri', 'roi'],
      config: {
        defaultValues: {
          initialValue: 100000,
          finalValue: 120000,
          years: 1,
        },
      },
      metaTitle: 'Yıllık Getiri Hesaplama | Finanscözüm',
      metaDescription: 'Yatırımınızın toplam ve yıllık getiri oranını hesaplayın. CAGR ile yıllıklaştırılmış getiri oranını öğrenin.',
    },
    {
      name: 'Net Bugünkü Değer (NPV)',
      slug: 'npv',
      description: 'Yatırım projelerinin bugünkü değerini hesaplayın',
      component: 'NPVCalculator',
      icon: 'Calculator',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      order: 9,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'yatirim',
      keywords: ['npv', 'net bugünkü değer', 'yatırım', 'nakit akışı'],
      config: {
        defaultValues: {
          initialInvestment: 100000,
          discountRate: 10,
        },
      },
      metaTitle: 'Net Bugünkü Değer (NPV) | Finanscözüm',
      metaDescription: 'Yatırım projelerinin bugünkü değerini hesaplayın. Proje karlılığını NPV ile değerlendirin.',
    },
    {
      name: 'İç Verim Oranı (IRR)',
      slug: 'irr',
      description: 'NPV\'nin sıfır olduğu faiz oranını hesaplayın',
      component: 'IRRCalculator',
      icon: 'Target',
      color: '#6366f1',
      bgColor: '#e0e7ff',
      order: 10,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'yatirim',
      keywords: ['irr', 'iç verim oranı', 'yatırım', 'faiz oranı'],
      config: {
        defaultValues: {
          initialInvestment: 100000,
        },
      },
      metaTitle: 'İç Verim Oranı (IRR) | Finanscözüm',
      metaDescription: 'NPV\'nin sıfır olduğu faiz oranını hesaplayın. Yatırım projelerinin iç verim oranını öğrenin.',
    },
    {
      name: 'ROI (Yatırım Getirisi)',
      slug: 'roi',
      description: 'Yatırımınızın getiri oranını yüzde olarak hesaplayın',
      component: 'ROICalculator',
      icon: 'TrendingUp',
      color: '#10b981',
      bgColor: '#d1fae5',
      order: 11,
      status: 'PUBLISHED',
      isFeatured: true,
      dataSourceType: 'STATIC',
      categorySlug: 'yatirim',
      keywords: ['roi', 'yatırım getirisi', 'getiri', 'karlılık'],
      config: {
        defaultValues: {
          investment: 100000,
          returnValue: 130000,
        },
      },
      metaTitle: 'ROI (Yatırım Getirisi) | Finanscözüm',
      metaDescription: 'Yatırımınızın getiri oranını yüzde olarak hesaplayın. ROI ile yatırım performansını değerlendirin.',
    },
    {
      name: 'Yatırım Karlılık Hesaplama',
      slug: 'yatirim-karlilik',
      description: 'Yatırımın karlılık oranını hesaplayın',
      component: 'InvestmentProfitabilityCalculator',
      icon: 'BarChart3',
      color: '#10b981',
      bgColor: '#d1fae5',
      order: 12,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'yatirim',
      keywords: ['yatırım', 'karlılık', 'getiri', 'roi'],
      config: {
        defaultValues: {
          investment: 100000,
          revenue: 150000,
        },
      },
      metaTitle: 'Yatırım Karlılık Hesaplama | Finanscözüm',
      metaDescription: 'Yatırımın karlılık oranını hesaplayın. Yatırım performansını değerlendirin.',
    },
    {
      name: 'Enflasyon Etkisi Hesaplama',
      slug: 'enflasyon-etkisi',
      description: 'Paranızın enflasyon sonrası satın alma gücünü hesaplayın',
      component: 'InflationCalculator',
      icon: 'TrendingDown',
      color: '#ef4444',
      bgColor: '#fee2e2',
      order: 13,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'yatirim',
      keywords: ['enflasyon', 'satın alma gücü', 'reel değer'],
      config: {
        defaultValues: {
          nominalValue: 100000,
          inflationRate: 20,
          years: 5,
        },
      },
      metaTitle: 'Enflasyon Etkisi Hesaplama | Finanscözüm',
      metaDescription: 'Paranızın enflasyon sonrası satın alma gücünü hesaplayın. Reel değeri öğrenin.',
    },
    {
      name: 'Yatırım Büyüme Oranı',
      slug: 'yatirim-buyume-orani',
      description: 'Yıllık bileşik büyüme oranını hesaplayın (CAGR)',
      component: 'GrowthRateCalculator',
      icon: 'LineChart',
      color: '#10b981',
      bgColor: '#d1fae5',
      order: 14,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'yatirim',
      keywords: ['cagr', 'büyüme', 'yatırım', 'getiri oranı'],
      config: {
        defaultValues: {
          initialValue: 100000,
          finalValue: 200000,
          years: 5,
        },
      },
      metaTitle: 'Yatırım Büyüme Oranı (CAGR) | Finanscözüm',
      metaDescription: 'Yıllık bileşik büyüme oranını hesaplayın. CAGR ile yatırım büyümesini ölçün.',
    },
    {
      name: 'Ortalama Getiri Hesaplama',
      slug: 'ortalama-getiri',
      description: 'Yatırım getirilerinin aritmetik ortalamasını hesaplayın',
      component: 'AverageReturnCalculator',
      icon: 'BarChart3',
      color: '#10b981',
      bgColor: '#d1fae5',
      order: 15,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'yatirim',
      keywords: ['ortalama', 'getiri', 'aritmetik ortalama'],
      config: {},
      metaTitle: 'Ortalama Getiri Hesaplama | Finanscözüm',
      metaDescription: 'Yatırım getirilerinin aritmetik ortalamasını hesaplayın. Ortalama performansı öğrenin.',
    },

    // İşletme Hesaplamaları
    {
      name: 'Break-Even (Başabaş Noktası)',
      slug: 'break-even',
      description: 'Kâr/zarar eşitliğinin sağlandığı üretim miktarını bulun',
      component: 'BreakEvenCalculator',
      icon: 'Target',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      order: 16,
      status: 'PUBLISHED',
      isFeatured: true,
      dataSourceType: 'STATIC',
      categorySlug: 'isletme',
      keywords: ['break-even', 'başabaş', 'maliyet', 'karlılık'],
      config: {
        defaultValues: {
          fixedCosts: 50000,
          variableCostPerUnit: 20,
          pricePerUnit: 50,
        },
      },
      metaTitle: 'Break-Even (Başabaş Noktası) | Finanscözüm',
      metaDescription: 'Kâr/zarar eşitliğinin sağlandığı üretim miktarını bulun. Başabaş analizi yapın.',
    },
    {
      name: 'Marj ve Kar Oranı Hesaplama',
      slug: 'marj-kar-orani',
      description: 'Brüt kar marjı ve kar oranını hesaplayın',
      component: 'MarginCalculator',
      icon: 'BarChart3',
      color: '#10b981',
      bgColor: '#d1fae5',
      order: 17,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'isletme',
      keywords: ['marj', 'kar oranı', 'brüt kar', 'karlılık'],
      config: {
        defaultValues: {
          revenue: 100000,
          cost: 60000,
        },
      },
      metaTitle: 'Marj ve Kar Oranı Hesaplama | Finanscözüm',
      metaDescription: 'Brüt kar marjı ve kar oranını hesaplayın. İşletme karlılığını ölçün.',
    },
    {
      name: 'Kâr / Zarar Hesaplama',
      slug: 'kar-zarar',
      description: 'Gelir ve giderleri karşılaştırarak net kâr/zararı hesaplayın',
      component: 'ProfitLossCalculator',
      icon: 'Receipt',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      order: 18,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'isletme',
      keywords: ['kâr', 'zarar', 'gelir', 'gider'],
      config: {
        defaultValues: {
          revenue: 100000,
          costs: 75000,
        },
      },
      metaTitle: 'Kâr / Zarar Hesaplama | Finanscözüm',
      metaDescription: 'Gelir ve giderleri karşılaştırarak net kâr/zararı hesaplayın.',
    },
    {
      name: 'Verimlilik / Performans Katsayısı',
      slug: 'verimlilik-katsayisi',
      description: 'Çıktı/girdi oranını hesaplayarak verimliliği ölçün',
      component: 'PerformanceCoefficientCalculator',
      icon: 'Zap',
      color: '#10b981',
      bgColor: '#d1fae5',
      order: 19,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'isletme',
      keywords: ['verimlilik', 'performans', 'çıktı', 'girdi'],
      config: {
        defaultValues: {
          output: 1000,
          input: 500,
        },
      },
      metaTitle: 'Verimlilik / Performans Katsayısı | Finanscözüm',
      metaDescription: 'Çıktı/girdi oranını hesaplayarak verimliliği ölçün.',
    },
    {
      name: 'Çalışma Sermayesi Hesaplama',
      slug: 'calisma-sermayesi',
      description: 'İşletmenin kısa vadeli finansal sağlığını ölçün',
      component: 'WorkingCapitalCalculator',
      icon: 'Wallet',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      order: 20,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'isletme',
      keywords: ['çalışma sermayesi', 'likidite', 'dönen varlıklar'],
      config: {
        defaultValues: {
          currentAssets: 200000,
          currentLiabilities: 100000,
        },
      },
      metaTitle: 'Çalışma Sermayesi Hesaplama | Finanscözüm',
      metaDescription: 'İşletmenin kısa vadeli finansal sağlığını ölçün. Likidite analizi yapın.',
    },
    {
      name: 'İşletme Sermaye İhtiyacı',
      slug: 'sermaye-ihtiyaci',
      description: 'İşletmenin ihtiyaç duyduğu ek sermayeyi hesaplayın',
      component: 'CapitalRequirementCalculator',
      icon: 'Briefcase',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      order: 21,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'isletme',
      keywords: ['sermaye', 'finansman', 'yatırım ihtiyacı'],
      config: {
        defaultValues: {
          totalInvestment: 500000,
          availableCapital: 300000,
        },
      },
      metaTitle: 'İşletme Sermaye İhtiyacı | Finanscözüm',
      metaDescription: 'İşletmenin ihtiyaç duyduğu ek sermayeyi hesaplayın.',
    },
    {
      name: 'Nakit Akışı Analizi',
      slug: 'nakit-akisi-analizi',
      description: 'Giriş ve çıkış nakit akışlarını analiz edin',
      component: 'CashFlowAnalyzerCalculator',
      icon: 'Coins',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      order: 22,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'isletme',
      keywords: ['nakit akışı', 'cash flow', 'analiz'],
      config: {},
      metaTitle: 'Nakit Akışı Analizi | Finanscözüm',
      metaDescription: 'Giriş ve çıkış nakit akışlarını analiz edin. Cash flow analizi yapın.',
    },

    // Bütçe Hesaplamaları
    {
      name: 'Basit Bütçe Planlayıcı',
      slug: 'basit-butce',
      description: 'Gelir ve giderlerinizi karşılaştırın',
      component: 'BudgetPlannerCalculator',
      icon: 'PieChart',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      order: 23,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'butce',
      keywords: ['bütçe', 'gelir', 'gider', 'tasarruf'],
      config: {
        defaultValues: {
          income: 50000,
          expenses: 40000,
        },
      },
      metaTitle: 'Basit Bütçe Planlayıcı | Finanscözüm',
      metaDescription: 'Gelir ve giderlerinizi karşılaştırın. Bütçe planlaması yapın.',
    },
    {
      name: 'Gelir – Gider Dengesi',
      slug: 'gelir-gider-dengesi',
      description: 'Gelir ve giderlerinizi analiz ederek bütçe dengesini değerlendirin',
      component: 'IncomeExpenseBalanceCalculator',
      icon: 'PieChart',
      color: '#6366f1',
      bgColor: '#e0e7ff',
      order: 24,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'butce',
      keywords: ['gelir', 'gider', 'denge', 'bütçe analizi'],
      config: {
        defaultValues: {
          income: 50000,
          expenses: 40000,
        },
      },
      metaTitle: 'Gelir – Gider Dengesi | Finanscözüm',
      metaDescription: 'Gelir ve giderlerinizi analiz ederek bütçe dengesini değerlendirin. Detaylı bütçe analizi yapın.',
    },
    {
      name: 'Yıllık Tasarruf Hedefi Hesaplama',
      slug: 'yillik-tasarruf-hedefi',
      description: 'Hedef tutara ulaşmak için gereken aylık tasarruf miktarını bulun',
      component: 'AnnualSavingsGoalCalculator',
      icon: 'PiggyBank',
      color: '#10b981',
      bgColor: '#d1fae5',
      order: 25,
      status: 'PUBLISHED',
      isFeatured: false,
      dataSourceType: 'STATIC',
      categorySlug: 'butce',
      keywords: ['tasarruf', 'hedef', 'planlama'],
      config: {
        defaultValues: {
          goal: 120000,
          years: 1,
        },
      },
      metaTitle: 'Yıllık Tasarruf Hedefi Hesaplama | Finanscözüm',
      metaDescription: 'Hedef tutara ulaşmak için gereken aylık tasarruf miktarını bulun.',
    },
  ];

  for (const toolData of tools) {
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
