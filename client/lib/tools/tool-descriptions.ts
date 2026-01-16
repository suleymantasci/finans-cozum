/**
 * Her araç için detaylı açıklamalar
 * Araç nedir, nasıl hesaplanır ve formül bilgileri
 */

export interface ToolDescription {
  whatIs: string // Araç nedir?
  howItWorks: string // Nasıl hesaplanır?
  formula?: string // Formül (karmaşık olanlar için)
  examples?: string[] // Örnekler (opsiyonel)
}

export const toolDescriptions: Record<string, ToolDescription> = {
  'basit-faiz': {
    whatIs: 'Basit faiz, yalnızca ana para üzerinden hesaplanan sabit getiri türüdür. Faiz kazancı ana paraya eklenmez, her dönem aynı tutar üzerinden hesaplanır.',
    howItWorks: 'Basit faiz hesaplamasında, ana para, faiz oranı ve süre çarpılarak faiz tutarı bulunur. Elde edilen faiz, ana paraya eklenerek toplam tutar hesaplanır.',
    formula: 'Faiz = Ana Para × (Faiz Oranı / 100) × Süre (Yıl)\nToplam = Ana Para + Faiz',
    examples: [
      '100.000 TL ana para, %10 yıllık faiz oranı, 1 yıl vade: 100.000 × 0,10 × 1 = 10.000 TL faiz',
      'Toplam tutar: 100.000 + 10.000 = 110.000 TL'
    ],
  },
  'bilesik-faiz': {
    whatIs: 'Bileşik faiz, her dönem sonunda kazanılan faizin ana paraya eklenerek bir sonraki dönemde bu toplam tutar üzerinden faiz hesaplanmasıdır. Bu sayede faiz üzerinden de faiz kazanılır.',
    howItWorks: 'Bileşik faizde, her dönem sonundaki getiri ana paraya eklenir ve bir sonraki dönem için bu yeni tutar üzerinden faiz hesaplanır. Bu işlem, "faizin faizi" olarak da bilinir ve zaman içinde daha yüksek getiri sağlar.',
    formula: 'Toplam = Ana Para × (1 + Faiz Oranı / Birleştirme Sıklığı)^(Birleştirme Sıklığı × Süre)\nFaiz = Toplam - Ana Para',
    examples: [
      '100.000 TL, %10 yıllık faiz, 2 yıl vade, aylık birleştirme:',
      'Toplam = 100.000 × (1 + 0,10/12)^(12×2) = 122.039 TL',
      'Faiz = 122.039 - 100.000 = 22.039 TL'
    ],
  },
  'yillik-getiri': {
    whatIs: 'Yıllık getiri, bir yatırımın belirli bir süre içindeki toplam ve ortalama yıllık kazancını gösteren göstergedir. Yatırım performansını değerlendirmek için kullanılır.',
    howItWorks: 'Toplam getiri oranı, başlangıç ve bitiş değeri arasındaki farkın başlangıç değerine oranıdır. Yıllıklaştırılmış getiri ise, yatırımın yıllık ortalama büyüme oranını gösterir.',
    formula: 'Toplam Getiri = ((Bitiş Değeri - Başlangıç Değeri) / Başlangıç Değeri) × 100%\nYıllık Getiri (CAGR) = ((Bitiş/Başlangıç)^(1/Yıl) - 1) × 100%',
  },
  'npv': {
    whatIs: 'Net Bugünkü Değer (NPV), gelecekteki nakit akışlarının bugünkü değerini hesaplayarak yatırım projelerinin karlılığını değerlendiren finansal analiz yöntemidir.',
    howItWorks: 'NPV hesaplamasında, gelecekteki nakit akışları belirli bir iskonto oranıyla bugünkü değere indirgenir. İlk yatırım tutarı bu değerlerden çıkarılarak net değer bulunur. Pozitif NPV, yatırımın karlı olduğunu gösterir.',
    formula: 'NPV = Σ(CFt / (1 + r)^t) - İlk Yatırım\nCFt = t dönemindeki nakit akışı\nr = İskonto oranı (faiz oranı)\nt = Dönem',
  },
  'irr': {
    whatIs: 'İç Verim Oranı (IRR), bir yatırım projesinin Net Bugünkü Değerini (NPV) sıfır yapan iskonto oranıdır. Yatırımın teorik karlılık oranını gösterir.',
    howItWorks: 'IRR, iteratif yöntemlerle (Newton-Raphson) hesaplanır. NPV formülünde iskonto oranı değiştirilerek NPV\'nin sıfır olduğu nokta bulunur. IRR, piyasa faiz oranından yüksekse yatırım karlı kabul edilir.',
    formula: 'IRR, NPV = 0 yapan r değeridir:\nΣ(CFt / (1 + r)^t) - İlk Yatırım = 0',
  },
  'roi': {
    whatIs: 'ROI (Return on Investment - Yatırım Getirisi), bir yatırımın yüzde olarak karlılık oranını gösteren finansal performans göstergesidir.',
    howItWorks: 'ROI, yatırımdan elde edilen kazancın (veya zararın), yatırım tutarına oranıdır. Yüzde olarak ifade edilir ve yatırım performansını karşılaştırmak için kullanılır.',
    formula: 'ROI = ((Geri Dönen Tutar - Yatırım Tutarı) / Yatırım Tutarı) × 100%',
    examples: [
      '100.000 TL yatırım, 130.000 TL geri dönüş:',
      'ROI = ((130.000 - 100.000) / 100.000) × 100% = %30'
    ],
  },
  'yatirim-karlilik': {
    whatIs: 'Yatırım karlılığı, bir yatırımın gelir üretme kapasitesini ölçen orandır. Yatırımın ne kadar karlı olduğunu gösterir.',
    howItWorks: 'Yatırım karlılığı, yatırımdan elde edilen gelirin yatırım tutarına oranıdır. Yüksek karlılık oranı, yatırımın daha etkili olduğunu gösterir.',
    formula: 'Karlılık Oranı = ((Gelir - Yatırım) / Yatırım) × 100%\nGetiri Oranı = Gelir / Yatırım',
  },
  'enflasyon-etkisi': {
    whatIs: 'Enflasyon etkisi, paranın zaman içinde satın alma gücünün ne kadar azaldığını gösteren hesaplamadır. Nominal değerin enflasyon sonrası reel değerini bulur.',
    howItWorks: 'Enflasyon etkisi hesaplamasında, nominal değer (bugünkü para değeri), belirli bir enflasyon oranı ve süreyle bugünkü satın alma gücüne indirgenir. Bu sayede paranın gerçek değeri görülür.',
    formula: 'Reel Değer = Nominal Değer / (1 + Enflasyon Oranı)^Yıl\nSatın Alma Gücü Kaybı = Nominal Değer - Reel Değer',
    examples: [
      '100.000 TL nominal değer, %20 yıllık enflasyon, 5 yıl:',
      'Reel Değer = 100.000 / (1,20)^5 = 40.188 TL',
      'Satın alma gücü kaybı: 100.000 - 40.188 = 59.812 TL'
    ],
  },
  'yatirim-buyume-orani': {
    whatIs: 'Yatırım büyüme oranı (CAGR - Compound Annual Growth Rate), bir yatırımın yıllık ortalama bileşik büyüme oranını gösterir. Yatırımın zaman içindeki büyümesini ölçer.',
    howItWorks: 'CAGR, başlangıç ve bitiş değeri arasındaki toplam büyümeyi yıl sayısına bölerek yıllık ortalama büyüme oranını hesaplar. Bu oran, yatırımın düzenli bir şekilde büyüdüğünü varsayar.',
    formula: 'CAGR = ((Bitiş Değeri / Başlangıç Değeri)^(1 / Yıl Sayısı) - 1) × 100%',
    examples: [
      '100.000 TL başlangıç, 200.000 TL bitiş, 5 yıl:',
      'CAGR = ((200.000 / 100.000)^(1/5) - 1) × 100% = %14,87'
    ],
  },
  'faiz-orani-donusturme': {
    whatIs: 'Faiz oranı dönüştürme, yıllık, aylık ve günlük faiz oranlarını birbirine çevirme işlemidir. Farklı ödeme sıklıkları için faiz oranlarını karşılaştırmak için kullanılır.',
    howItWorks: 'Yıllık faiz oranı 12\'ye bölünerek aylık, 365\'e bölünerek günlük faiz oranı bulunur. Tersine, aylık oran 12 ile, günlük oran 365 ile çarpılarak yıllık oran hesaplanır.',
    formula: 'Aylık Oran = Yıllık Oran / 12\nGünlük Oran = Yıllık Oran / 365\nYıllık Oran = Aylık Oran × 12',
  },
  'toplam-faiz-maliyeti': {
    whatIs: 'Toplam faiz maliyeti, bir kredinin vade süresi boyunca ödenecek toplam faiz tutarıdır. Kredinin gerçek maliyetini gösterir.',
    howItWorks: 'Toplam faiz maliyeti, tüm vade boyunca ödenecek taksitlerin toplamından ana para tutarı çıkarılarak hesaplanır. Bu değer, kredinin gerçek maliyetini gösterir.',
    formula: 'Toplam Faiz = (Aylık Taksit × Vade) - Ana Para\nToplam Ödeme = Aylık Taksit × Vade',
  },
  'aylik-taksit': {
    whatIs: 'Aylık taksit, kredinin her ay ödenecek eşit tutarıdır. Her taksit, ana para ve faiz ödemelerini içerir.',
    howItWorks: 'Aylık taksit, anüite (annuity) formülü ile hesaplanır. Bu formül, faiz ve ana para ödemelerini eşit taksitlere böler. İlk dönemlerde faiz daha fazla, son dönemlerde ana para daha fazla ödenir.',
    formula: 'Aylık Taksit = Ana Para × [r(1+r)^n] / [(1+r)^n - 1]\nr = Aylık faiz oranı (Yıllık / 12)\nn = Vade (ay)',
    examples: [
      '100.000 TL kredi, %12 yıllık faiz, 36 ay vade:',
      'Aylık faiz: 0,12 / 12 = 0,01',
      'Taksit = 100.000 × [0,01(1,01)^36] / [(1,01)^36 - 1] = 3.321,36 TL'
    ],
  },
  'amortisman-tablosu': {
    whatIs: 'Amortisman tablosu, kredinin her ay ödenecek ana para, faiz ve kalan bakiyeyi gösteren detaylı ödeme planıdır.',
    howItWorks: 'Amortisman tablosunda, her ay için sabit taksit tutarı belirlenir. Aylık faiz, kalan bakiye üzerinden hesaplanır. Ana para ödemesi ise taksit tutarından faiz çıkarılarak bulunur.',
    formula: 'Aylık Faiz = Kalan Bakiye × Aylık Faiz Oranı\nAna Para Ödemesi = Taksit - Aylık Faiz\nYeni Bakiye = Eski Bakiye - Ana Para Ödemesi',
  },
  'odeme-plani-ciktisi': {
    whatIs: 'Ödeme planı çıktısı, kredi için detaylı ödeme çizelgesidir. Her dönem için ödeme, ana para, faiz ve kümülatif toplamları gösterir.',
    howItWorks: 'Ödeme planı, amortisman tablosuna ek olarak kümülatif ana para ve faiz ödemelerini de içerir. Bu sayede belirli bir dönemdeki toplam ödemeler görülebilir.',
    formula: 'Her dönem için:\n- Aylık Taksit (sabit)\n- Ana Para Ödemesi (artar)\n- Faiz Ödemesi (azalır)\n- Kümülatif Toplamlar',
  },
  'break-even': {
    whatIs: 'Break-even (başabaş) noktası, toplam gelirlerin toplam maliyetlere eşit olduğu, yani ne kâr ne zarar edildiği üretim veya satış miktarıdır.',
    howItWorks: 'Başabaş noktası, sabit maliyetlerin birim katkı marjına (satış fiyatı - birim değişken maliyet) bölünmesiyle bulunur. Bu noktadan sonra üretim/satış karlı hale gelir.',
    formula: 'Başabaş Miktarı = Sabit Maliyetler / (Birim Satış Fiyatı - Birim Değişken Maliyet)\nBaşabaş Geliri = Başabaş Miktarı × Birim Satış Fiyatı',
    examples: [
      '50.000 TL sabit maliyet, 50 TL birim fiyat, 20 TL birim maliyet:',
      'Başabaş = 50.000 / (50 - 20) = 1.667 adet',
      'Başabaş geliri = 1.667 × 50 = 83.350 TL'
    ],
  },
  'marj-kar-orani': {
    whatIs: 'Marj ve kar oranı, bir işletmenin satış gelirlerinden ne kadar kâr elde ettiğini gösteren karlılık göstergeleridir. Brüt kar marjı ve kar oranı olarak hesaplanır.',
    howItWorks: 'Brüt kar marjı, net kârın satış gelirlerine oranıdır. Kar oranı ise net kârın toplam maliyetlere oranıdır. Her iki oran da işletmenin karlılığını ölçer.',
    formula: 'Brüt Kar Marjı = ((Satış Geliri - Toplam Maliyet) / Satış Geliri) × 100%\nKar Oranı = ((Satış Geliri - Toplam Maliyet) / Toplam Maliyet) × 100%',
  },
  'kar-zarar': {
    whatIs: 'Kâr/Zarar hesaplaması, bir işletmenin belirli bir dönemdeki gelir ve giderlerini karşılaştırarak net kâr veya zarar durumunu gösteren temel finansal analizdir.',
    howItWorks: 'Kâr/zarar hesaplamasında, toplam gelirlerden toplam giderler çıkarılarak net sonuç bulunur. Pozitif sonuç kâr, negatif sonuç zarar anlamına gelir.',
    formula: 'Net Kâr/Zarar = Toplam Gelir - Toplam Gider\nKar Marjı = (Net Kâr / Toplam Gelir) × 100%',
  },
  'verimlilik-katsayisi': {
    whatIs: 'Verimlilik/Performans katsayısı, bir işletmenin üretim sürecinde girdileri ne kadar etkili kullandığını ölçen göstergedir. Çıktı/girdi oranı olarak hesaplanır.',
    howItWorks: 'Verimlilik katsayısı, üretilen çıktı miktarının kullanılan girdi miktarına oranıdır. 1\'den büyük değerler verimli, 1\'den küçük değerler verimsiz üretimi gösterir.',
    formula: 'Performans Katsayısı = Çıktı / Girdi\nVerimlilik Oranı = (Çıktı / Girdi) × 100%',
  },
  'calisma-sermayesi': {
    whatIs: 'Çalışma sermayesi, bir işletmenin kısa vadeli yükümlülüklerini karşılayabilme kapasitesini gösteren finansal göstergedir. Likidite durumunu ölçer.',
    howItWorks: 'Çalışma sermayesi, dönen varlıklardan kısa vadeli borçların çıkarılmasıyla hesaplanır. Pozitif değer işletmenin likiditesinin iyi olduğunu, negatif değer ise finansal risk olduğunu gösterir.',
    formula: 'Çalışma Sermayesi = Dönen Varlıklar - Kısa Vadeli Borçlar\nÇalışma Sermayesi Oranı = Dönen Varlıklar / Kısa Vadeli Borçlar',
  },
  'sermaye-ihtiyaci': {
    whatIs: 'İşletme sermaye ihtiyacı, bir işletmenin faaliyetlerini sürdürmek veya projelerini gerçekleştirmek için ihtiyaç duyduğu ek finansman miktarıdır.',
    howItWorks: 'Sermaye ihtiyacı, toplam yatırım tutarından mevcut sermaye çıkarılarak hesaplanır. Bu değer, işletmenin ne kadar ek finansmana ihtiyacı olduğunu gösterir.',
    formula: 'Sermaye İhtiyacı = Toplam Yatırım İhtiyacı - Mevcut Sermaye\nFinansman Oranı = (Mevcut Sermaye / Toplam Yatırım) × 100%',
  },
  'nakit-akisi-analizi': {
    whatIs: 'Nakit akışı analizi, bir işletmenin belirli bir dönemdeki giriş ve çıkış nakit akışlarını inceleyerek finansal sağlığını değerlendiren analiz yöntemidir.',
    howItWorks: 'Nakit akışı analizinde, her dönem için giriş (gelirler) ve çıkış (giderler) nakit akışları kaydedilir. Net nakit akışı, girişlerden çıkışların çıkarılmasıyla bulunur.',
    formula: 'Net Nakit Akışı = Toplam Nakit Girişleri - Toplam Nakit Çıkışları\nDönemsel Net Akış = Dönemsel Giriş - Dönemsel Çıkış',
  },
  'basit-butce': {
    whatIs: 'Basit bütçe planlayıcı, kişisel veya işletme finansmanında gelir ve giderleri karşılaştırarak net bütçe durumunu gösteren temel finansal planlama aracıdır.',
    howItWorks: 'Basit bütçe hesaplamasında, toplam gelirlerden toplam giderler çıkarılarak net bütçe bulunur. Pozitif değer tasarruf, negatif değer açık anlamına gelir.',
    formula: 'Net Bütçe = Toplam Gelir - Toplam Gider\nTasarruf Oranı = (Net Bütçe / Toplam Gelir) × 100%',
  },
  'gelir-gider-dengesi': {
    whatIs: 'Gelir-Gider dengesi, gelir ve giderlerin detaylı analizini yaparak bütçe sağlığını değerlendiren kapsamlı finansal analiz aracıdır.',
    howItWorks: 'Gelir-gider dengesi analizinde, gelir ve gider oranları hesaplanır, net bakiye belirlenir ve tasarruf potansiyeli değerlendirilir. Bu analiz, bütçe yönetimini iyileştirmek için yol gösterir.',
    formula: 'Net Bakiye = Toplam Gelir - Toplam Gider\nGider Oranı = (Toplam Gider / Toplam Gelir) × 100%\nTasarruf Oranı = (Net Bakiye / Toplam Gelir) × 100%',
  },
  'yillik-tasarruf-hedefi': {
    whatIs: 'Yıllık tasarruf hedefi hesaplama, belirli bir sürede belirlenen tutara ulaşmak için gerekli aylık ve yıllık tasarruf miktarını hesaplayan planlama aracıdır.',
    howItWorks: 'Yıllık tasarruf hedefi, hedef tutarın toplam ay sayısına bölünmesiyle aylık tasarruf miktarı, yıl sayısına bölünmesiyle yıllık tasarruf miktarı bulunur.',
    formula: 'Aylık Tasarruf = Hedef Tutar / (Yıl × 12)\nYıllık Tasarruf = Hedef Tutar / Yıl',
  },
  'ortalama-getiri': {
    whatIs: 'Ortalama getiri, bir yatırımın farklı dönemlerdeki getiri oranlarının aritmetik ortalamasıdır. Yatırımın ortalama performansını gösterir.',
    howItWorks: 'Ortalama getiri, tüm dönem getirilerinin toplamının dönem sayısına bölünmesiyle hesaplanır. Bu değer, yatırımın genel performansını özetler.',
    formula: 'Ortalama Getiri = (Getiri1 + Getiri2 + ... + GetiriN) / N\nN = Dönem sayısı',
  },
}
