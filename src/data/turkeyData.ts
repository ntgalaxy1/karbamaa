/**
 * Comprehensive Turkey Cities & Districts Map
 * Enables dynamic district select menus when a city is selected across the app.
 */

export interface CityDistrictEntry {
  city: string;
  districts: string[];
}

export const CITY_DISTRICTS_MAP: Record<string, string[]> = {
  'استانبول': [
    'همه مناطق استانبول',
    'فاتیح (Fatih)',
    'مرتر (Güngören / Merter)',
    'شیشلی (Şişli)',
    'تقسیم / بی‌اوغلو (Beyoğlu / Taksim)',
    'کادیکوی (Kadıköy)',
    'بیلیک‌دوزو (Beylikdüzü)',
    'باکرکوی (Bakırköy)',
    'لاله‌لی / آکسارای (Laleli / Aksaray)',
    'باشاک‌شهیر (Başakşehir)',
    'اسن‌یورت (Esenyurt)',
    'زیتین‌بورنو (Zeytinburnu)',
    'اسکودار (Üsküdar)',
    'ماسلاک / ساری‌یر (Maslak / Sarıyer)',
    'پندیک (Pendik)',
    'باغچه‌لی‌اولر (Bahçelievler)',
    'مال‌تپه (Maltepe)',
    'کارتال (Kartal)',
    'عمرانیه (Ümraniye)',
    'آوجیلار (Avcılar)',
    'بشیکتاش (Beşiktaş)',
    'کوچوک‌چکمه‌جه (Küçükçekmece)',
    'بویوک‌چکمه‌جه (Büyükçekmece)',
    'ساری‌یر (Sarıyer)',
    'گازت‌پاشا (Gaziosmanpaşa)',
    'سلطان‌بیلی (Sultanbeyli)',
    'توزلا (Tuzla)',
    'سیلیوری (Silivri)',
    'آرناووت‌کوی (Arnavutköy)',
  ],
  'آنکارا': [
    'همه مناطق آنکارا',
    'چانکایا (Çankaya)',
    'کچی‌اورن (Keçiören)',
    'ینی‌محله (Yenimahalle)',
    'ماماک (Mamak)',
    'اتیمسگوت (Etimesgut)',
    'آلتین‌داغ (Altındağ)',
    'سینجان (Sincan)',
    'گول‌باشی (Gölbaşı)',
    'پورساکلار (Pursaklar)',
    'کاهرامان‌کازان (Kahramankazan)',
  ],
  'ازمیر': [
    'همه مناطق ازمیر',
    'کوناک / السنجاک (Konak / Alsancak)',
    'کارشی‌یامک (Karşıyaka)',
    'بورنووا (Bornova)',
    'بوجه (Buca)',
    'چیگلی (Çiğli)',
    'گوزل‌باغچه (Güzelbahçe)',
    'چشمه (Çeşme)',
    'گازلی‌میر (Gaziemir)',
    'کارابالار (Karabağlar)',
    'توربالی (Torbalı)',
    'آلیاقا (Aliağa)',
  ],
  'آنتالیا': [
    'همه مناطق آنتالیا',
    'مرادپاشا / لارا (Muratpaşa / Lara)',
    'کونیالتی (Konyaaltı)',
    'کپز (Kepez)',
    'آلانیا (Alanya)',
    'ماناوگات (Manavgat)',
    'کمر (Kemer)',
    'سریک / بلک (Serik / Belek)',
    'کاش (Kaş)',
    'کوملوجا (Kumluca)',
  ],
  'بورسا': [
    'همه مناطق بورسا',
    'نیلوفر (Nilüfer)',
    'عثمان‌غازی (Osmangazi)',
    'یلدیرم (Yıldırım)',
    'کستل (Kestel)',
    'گملیک (Gemlik)',
    'اینه‌گول (İnegöl)',
    'مودانیا (Mudanya)',
  ],
  'ترابزون': [
    'همه مناطق ترابزون',
    'اورتا‌حصار (Ortahisar)',
    'آکچه‌آباد (Akçaabat)',
    'یومرا (Yomra)',
    'سورمنه (Sürmene)',
    'اوف (Of)',
  ],
  'ارزروم': [
    'همه مناطق ارزروم',
    'یاقوتیه (Yakutiye)',
    'پالاندوکن (Palandöken)',
    'عزیزیه (Aziziye)',
  ],
  'آدانا': [
    'همه مناطق آدانا',
    'سیهان (Seyhan)',
    'چوکوروا (Çukurova)',
    'یورگیر (Yüreğir)',
    'ساری‌چام (Sarıçam)',
  ],
  'غازی‌آنتپ': [
    'همه مناطق غازی‌آنتپ',
    'شاهین‌بی (Şahinbey)',
    'شهیدکامل (Şehitkamil)',
  ],
  'قونیه': [
    'همه مناطق قونیه',
    'سلجوقلو (Selçuklu)',
    'مرام (Meram)',
    'کاراتای (Karatay)',
  ],
  'مرسین': [
    'همه مناطق مرسین',
    'ینی‌شهیر (Yenişehir)',
    'تورسوس (Tarsus)',
    'مزیتلی (Mezitli)',
    'آک‌دنیز (Akdeniz)',
    'توروسلار (Toroslar)',
    'اردملی (Erdemli)',
  ],
  'اسکی‌شهر': [
    'همه مناطق اسکی‌شهر',
    'تپه‌باشی (Tepebaşı)',
    'ادون‌پازاری (Odunpazarı)',
  ],
  'سامسون': [
    'همه مناطق سامسون',
    'آتاکوم (Atakum)',
    'ایلک‌آدیم (İlkadım)',
    'جانیك (Canik)',
    'بافرا (Bafra)',
  ],
  'دنیزلی': [
    'همه مناطق دنیزلی',
    'پاموک‌کاله (Pamukkale)',
    'مرکز‌افندی (Merkezefendi)',
  ],
  'کایسری': [
    'همه مناطق کایسری',
    'ملیک‌غازی (Melikgazi)',
    'کوجاسینان (Kocasinan)',
    'تلاس (Talas)',
  ],
};

export const ALL_TURKEY_CITIES: string[] = [
  'همه شهرها',
  'استانبول',
  'آنکارا',
  'ازمیر',
  'آنتالیا',
  'بورسا',
  'ترابزون',
  'ارزروم',
  'آدانا',
  'غازی‌آنتپ',
  'قونیه',
  'مرسین',
  'اسکی‌شهر',
  'سامسون',
  'دنیزلی',
  'کایسری',
];

/**
 * Returns district options for a given city.
 * Falls back to default districts if city is not found.
 */
export function getDistrictsForCity(cityName?: string): string[] {
  if (!cityName || cityName === 'همه شهرها' || cityName === 'سراسری ترکیه') {
    return [
      'همه مناطق',
      'فاتیح (Fatih)',
      'تقسیم / بی‌اوغلو (Taksim)',
      'شیشلی (Şişli)',
      'کادیکوی (Kadıköy)',
      'نیلوفر (Nilüfer)',
      'چانکایا (Çankaya)',
      'لارا (Lara Beach)',
    ];
  }

  const found = CITY_DISTRICTS_MAP[cityName];
  if (found && found.length > 0) {
    return found;
  }

  return ['همه مناطق', `مرکز ${cityName}`, `منطقه ۱ ${cityName}`, `منطقه ۲ ${cityName}`];
}
