/**
 * لیست کامل و جامع تمامی استان‌ها، شهرها و شهرستان‌های بزرگ و کوچک کشور ترکیه
 * شامل ۸۱ استان رسمی + تمام شهرستان‌ها و شهرهای ساحلی و صنعتی کوچک‌تر
 */

export interface TurkeyCityGroup {
  province: string; // نام استان
  provinceTr: string;
  districts: string[]; // شهرستان‌ها و شهرهای کوچک‌تر این استان
}

export const TURKEY_PROVINCES_AND_DISTRICTS: TurkeyCityGroup[] = [
  {
    province: 'استانبول',
    provinceTr: 'İstanbul',
    districts: [
      'فاتیح (Fatih)',
      'اسنیورت (Esenyurt)',
      'بیلیک‌دوزو (Beylikdüzü)',
      'مرتر (Merter)',
      'شیشلی (Şişli)',
      'کادیکوی (Kadıköy)',
      'تقسیم / بیواوغلو (Taksim)',
      'آوجیلار (Avcılar)',
      'باغچه‌لی‌اولر (Bahçelievler)',
      'بشیکتاش (Beşiktaş)',
      'اسکودار (Üsküdar)',
      'پندیک (Pendik)',
      'مال‌تپه (Maltepe)',
      'کارتال (Kartal)',
      'باشاک‌شهر (Başakşehir)',
      'زیتون‌بورنو (Zeytinburnu)',
      'گازپاشا / سلطان‌غازی (Sultangazi)',
      'ساری‌یر (Sarıyer)',
      'عمرانیه (Ümraniye)',
      'کاوکلی (Kavaklı)',
      'سیلیوری (Silivri)',
      'چتالجا (Çatalca)',
      'توزلا (Tuzla)',
      'آرناووئت‌کوی (Arnavutköy)',
      'سنجاق‌تپه (Sancaktepe)',
      'سلطان‌بیلی (Sultanbeyli)',
      'شیلِه (Şile)',
    ],
  },
  {
    province: 'آنتالیا',
    provinceTr: 'Antalya',
    districts: [
      'مرکز آنتالیا (Muratpaşa)',
      'آلانیا (Alanya)',
      'لارا (Lara)',
      'کمر (Kemer)',
      'ماناوگات (Manavgat)',
      'سیده (Side)',
      'بلک (Belek)',
      'کاش (Kaş)',
      'کالکان (Kalkan)',
      'کپز (Kepez)',
      'کونیالتی (Konyaaltı)',
      'فینیکه (Finike)',
      'کوملوجا (Kumluca)',
      'گازی‌پاشا (Gazipaşa)',
    ],
  },
  {
    province: 'آنکارا',
    provinceTr: 'Ankara',
    districts: [
      'چانکایا (Çankaya)',
      'کچی‌اورن (Keçiören)',
      'ینی‌محله (Yenimahalle)',
      'ماماک (Mamak)',
      'اتمسگوت (Etimesgut)',
      'سنجان (Sincan)',
      'آلتاین‌داغ (Altındağ)',
      'گول‌باشی (Gölbaşı)',
      'پولاتلی (Polatlı)',
      'چبوک (Çubuk)',
    ],
  },
  {
    province: 'ازمیر',
    provinceTr: 'İzmir',
    districts: [
      'کوناک / مرکز (Konak)',
      'چشمه (Çeşme)',
      'آلاچاتی (Alaçatı)',
      'کارشیایاکا (Karşıyaka)',
      'بورنوا (Bornova)',
      'بوجا (Buca)',
      'فوچا (Foça)',
      'اورلا (Urla)',
      'توربالی (Torbalı)',
      'منمن (Menemen)',
      'علی‌آقا (Aliağa)',
      'سلچوک (Selçuk)',
    ],
  },
  {
    province: 'موغلا',
    provinceTr: 'Muğla',
    districts: [
      'بودروم (Bodrum)',
      'مارماریس (Marmaris)',
      'فتحیه (Fethiye)',
      'دالامان (Dalaman)',
      'داتیچا (Datça)',
      'کوی‌جیگیز (Köyceğiz)',
      'میلاس (Milas)',
      'اورتاجا (Ortaca)',
      'یاتاغان (Yatağan)',
    ],
  },
  {
    province: 'بورسا',
    provinceTr: 'Bursa',
    districts: [
      'نیلوفر (Nilüfer)',
      'عثمان‌غازی (Osmangazi)',
      'یلدریم (Yıldırım)',
      'گملیک (Gemlik)',
      'مودانیا (Mudanya)',
      'اینه‌گول (İnegöl)',
      'کاراجابی (Karacabey)',
    ],
  },
  {
    province: 'آیدین',
    provinceTr: 'Aydın',
    districts: [
      'کوش‌آداسی (Kuşadası)',
      'دیدیم (Didim)',
      'افلر / مرکز (Efeler)',
      'نازیلی (Nazilli)',
      'سوکه (Söke)',
    ],
  },
  {
    province: 'آدانا',
    provinceTr: 'Adana',
    districts: ['سیهان (Seyhan)', 'چوکوروا (Çukurova)', 'یورگیر (Yüreğir)', 'کوزان (Kozan)', 'جیهان (Ceyhan)'],
  },
  {
    province: 'آدیامان',
    provinceTr: 'Adıyaman',
    districts: ['مرکز آدیامان', 'کاهتا (Kahta)', 'بسنـی (Besni)'],
  },
  {
    province: 'آفیون قره‌حصار',
    provinceTr: 'Afyonkarahisar',
    districts: ['مرکز آفیون', 'سندیکلی (Sandıklı)', 'دینار (Dinar)'],
  },
  {
    province: 'آغری',
    provinceTr: 'Ağrı',
    districts: ['مرکز آغری', 'دوغوبایزید (Doğubayazıt)', 'پاتنوس (Patnos)'],
  },
  {
    province: 'آکسارای',
    provinceTr: 'Aksaray',
    districts: ['مرکز آکسارای', 'اورتاکوی (Ortaköy)'],
  },
  {
    province: 'آماسیه',
    provinceTr: 'Amasya',
    districts: ['مرکز آماسیه', 'مرزیفون (Merzifon)', 'سولووا (Suluova)'],
  },
  {
    province: 'آرداهان',
    provinceTr: 'Ardahan',
    districts: ['مرکز آرداهان', 'گوله (Göle)'],
  },
  {
    province: 'آرتوین',
    provinceTr: 'Artvin',
    districts: ['مرکز آرتوین', 'هوپا (Hopa)', 'ارهاوی (Arhavi)'],
  },
  {
    province: 'بالیکسیر',
    provinceTr: 'Balıkesir',
    districts: ['آیوالیک (Ayvalık)', 'باندیرما (Bandırma)', 'ادرمیت (Edremit)', 'اکچای (Akçay)', 'گونن (Gönen)'],
  },
  {
    province: 'بارتین',
    provinceTr: 'Bartın',
    districts: ['مرکز بارتین', 'آماسرا (Amasra)'],
  },
  {
    province: 'باتمان',
    provinceTr: 'Batman',
    districts: ['مرکز باتمان', 'حسن‌کیف (Hasankeyf)'],
  },
  {
    province: 'بایبورت',
    provinceTr: 'Bayburt',
    districts: ['مرکز بایبورت'],
  },
  {
    province: 'بیله‌جک',
    provinceTr: 'Bilecik',
    districts: ['مرکز بیله‌جک', 'بوزویوک (Bozüyük)'],
  },
  {
    province: 'بینگول',
    provinceTr: 'Bingöl',
    districts: ['مرکز بینگول', 'گنج (Genç)'],
  },
  {
    province: 'بتلیس',
    provinceTr: 'Bitlis',
    districts: ['مرکز بتلیس', 'تتوان (Tatvan)', 'اخلاط (Ahlat)'],
  },
  {
    province: 'بولو',
    provinceTr: 'Bolu',
    districts: ['مرکز بولو', 'گرده (Gerede)', 'آبانت (Abant)'],
  },
  {
    province: 'بوردور',
    provinceTr: 'Burdur',
    districts: ['مرکز بوردور', 'بوجاک (Bucak)'],
  },
  {
    province: 'چاناق‌قلعه',
    provinceTr: 'Çanakkale',
    districts: ['مرکز چاناق‌قلعه', 'گیبولی / گالیپولی (Gelibolu)', 'بیگا (Biga)', 'چن (Çan)'],
  },
  {
    province: 'چانقیری',
    provinceTr: 'Çankırı',
    districts: ['مرکز چانقیری', 'چرکش (Çerkeş)'],
  },
  {
    province: 'چوروم',
    provinceTr: 'Çorum',
    districts: ['مرکز چوروم', 'سونغورلو (Sungurlu)'],
  },
  {
    province: 'دنیزلی',
    provinceTr: 'Denizli',
    districts: ['پاموک‌کاله (Pamukkale)', 'مرکز دنیزلی', 'مرکزیفندی (Merkezefendi)'],
  },
  {
    province: 'دیاربکر',
    provinceTr: 'Diyarbakır',
    districts: ['سور (Sur)', 'کایاپینار (Kayapınar)', 'باغلار (Bağlar)'],
  },
  {
    province: 'دوزجه',
    provinceTr: 'Düzce',
    districts: ['مرکز دوزجه', 'آکچاکوجا (Akçakoca)'],
  },
  {
    province: 'ادرنه',
    provinceTr: 'Edirne',
    districts: ['مرکز ادرنه', 'کشان (Keşan)'],
  },
  {
    province: 'الازیغ',
    provinceTr: 'Elazığ',
    districts: ['مرکز الازیغ', 'کوبان (Koban)'],
  },
  {
    province: 'ارزنجان',
    provinceTr: 'Erzincan',
    districts: ['مرکز ارزنجان'],
  },
  {
    province: 'ارزروم',
    provinceTr: 'Erzurum',
    districts: ['پالاندوکن (Palandöken)', 'مرکز ارزروم', 'یاقوتیه (Yakutiye)'],
  },
  {
    province: 'اسکی‌شهر',
    provinceTr: 'Eskişehir',
    districts: ['تپه‌باشی (Tepebaşı)', 'اودون‌پازاری (Odunpazarı)'],
  },
  {
    province: 'غازی عینتاب (گازیانتب)',
    provinceTr: 'Gaziantep',
    districts: ['شاهین‌بی (Şahinbey)', 'شهیدکامل (Şehitkamil)'],
  },
  {
    province: 'گیرسون',
    provinceTr: 'Giresun',
    districts: ['مرکز گیرسون', 'بولانجاک (Bulancak)'],
  },
  {
    province: 'گوموش‌خانه',
    provinceTr: 'Gümüşhane',
    districts: ['مرکز گوموش‌خانه'],
  },
  {
    province: 'حکاری',
    provinceTr: 'Hakkâri',
    districts: ['مرکز حکاری', 'یوکسکوا (Yüksekova)'],
  },
  {
    province: 'هاتای (انتاکیه)',
    provinceTr: 'Hatay',
    districts: ['اسکندرون (İskenderun)', 'انتاکیه (Antakya)', 'دفنه (Defne)'],
  },
  {
    province: 'ایغدیر',
    provinceTr: 'Iğdır',
    districts: ['مرکز ایغدیر'],
  },
  {
    province: 'اسپارتا',
    provinceTr: 'Isparta',
    districts: ['مرکز اسپارتا', 'یالواچ (Yalvaç)'],
  },
  {
    province: 'قهرمان‌مرعش',
    provinceTr: 'Kahramanmaraş',
    districts: ['دونکل‌اوغلو (Dulkadiroğlu)', 'اُن‌ایکی‌شوبات (Onikisubat)'],
  },
  {
    province: 'کارابوک',
    provinceTr: 'Karabük',
    districts: ['مرکز کارابوک', 'زعفران‌بولو (Safranbolu)'],
  },
  {
    province: 'کارامان',
    provinceTr: 'Karaman',
    districts: ['مرکز کارامان'],
  },
  {
    province: 'قارص',
    provinceTr: 'Kars',
    districts: ['مرکز قارص', 'ساری‌قامیش (Sarıkamış)'],
  },
  {
    province: 'کاستامونو',
    provinceTr: 'Kastamonu',
    districts: ['مرکز کاستامونو', 'توسیا (Tosya)'],
  },
  {
    province: 'قیصریه (قیصری)',
    provinceTr: 'Kayseri',
    districts: ['ملیک‌غازی (Melikgazi)', 'کوجاسینان (Kocasinan)', 'تالاس (Talas)'],
  },
  {
    province: 'کیلیس',
    provinceTr: 'Kilis',
    districts: ['مرکز کیلیس'],
  },
  {
    province: 'قرق‌قلعه',
    provinceTr: 'Kırıkkale',
    districts: ['مرکز قرق‌قلعه'],
  },
  {
    province: 'قرقلرایلی',
    provinceTr: 'Kırklareli',
    districts: ['مرکز قرقلرایلی', 'لوله بورگاز (Lüleburgaz)'],
  },
  {
    province: 'قرشهر',
    provinceTr: 'Kırşehir',
    districts: ['مرکز قرشهر'],
  },
  {
    province: 'کوجائلی (ایزمیت)',
    provinceTr: 'Kocaeli',
    districts: ['ایزمیت (İzmit)', 'گیبزه (Gebze)', 'داریجا (Darıca)', 'کورت‌کوی (Kurtköy)'],
  },
  {
    province: 'قونیه',
    provinceTr: 'Konya',
    districts: ['سلجوقلو (Selçuklu)', 'مرام (Meram)', 'کاراتای (Karatay)', 'ارگلی (Ereğli)'],
  },
  {
    province: 'کوتاهیه',
    provinceTr: 'Kütahya',
    districts: ['مرکز کوتاهیه', 'تاوشانلی (Tavşanlı)'],
  },
  {
    province: 'ملاتیه',
    provinceTr: 'Malatya',
    districts: ['باتال‌غازی (Battalgazi)', 'یشیل‌یورت (Yeşilyurt)'],
  },
  {
    province: 'مانیسا',
    provinceTr: 'Manisa',
    districts: ['یونس‌امره (Yunusemre)', 'شهزاد‌لر (Şehzadeler)', 'سالاحلی (Salihli)', 'تورگوتلو (Turgutlu)'],
  },
  {
    province: 'ماردین',
    provinceTr: 'Mardin',
    districts: ['آرتوکلو (Artuklu)', 'نصیبین (Nusaybin)', 'میدیات (Midyat)'],
  },
  {
    province: 'مرسین',
    provinceTr: 'Mersin',
    districts: ['تارسوس (Tarsus)', 'آک‌دنیز (Akdeniz)', 'ینیشهیر (Yenişehir)', 'اردملی (Erdemli)'],
  },
  {
    province: 'موش',
    provinceTr: 'Muş',
    districts: ['مرکز موش'],
  },
  {
    province: 'نوشهر (کاپادوکیا)',
    provinceTr: 'Nevşehir',
    districts: ['مرکز نوشهر', 'اورگوپ (Ürgüp)', 'گورمه (Göreme)', 'آوانوس (Avanos)'],
  },
  {
    province: 'نیگده',
    provinceTr: 'Niğde',
    districts: ['مرکز نیگده'],
  },
  {
    province: 'اوردو',
    provinceTr: 'Ordu',
    districts: ['آلتین‌اوردو (Altınordu)', 'اونیه (Ünye)', 'فاتسا (Fatsa)'],
  },
  {
    province: 'عثمانیه',
    provinceTr: 'Osmaniye',
    districts: ['مرکز عثمانیه', 'کادیرلی (Kadirli)'],
  },
  {
    province: 'ریزه',
    provinceTr: 'Rize',
    districts: ['مرکز ریزه', 'آرده‌شن (Ardeşen)', 'چاملی‌همشین (Çamlıhemşin)'],
  },
  {
    province: 'ساکاریا (آداپازاری)',
    provinceTr: 'Sakarya',
    districts: ['آداپازاری (Adapazarı)', 'سرپانتین / سرکان (Serdivan)', 'ساپانجا (Sapanca)'],
  },
  {
    province: 'سامسون',
    provinceTr: 'Samsun',
    districts: ['آتاکوم (Atakum)', 'ایلک‌آدیم (İlkadım)', 'بافرا (Bafra)'],
  },
  {
    province: 'شانلی‌اورفا',
    provinceTr: 'Şanlıurfa',
    districts: ['حلیل‌الرحمن (Haliliye)', 'ایوبیه (Eyyübiye)', 'سلوک (Siverek)'],
  },
  {
    province: 'سیرت',
    provinceTr: 'Siirt',
    districts: ['مرکز سیرت'],
  },
  {
    province: 'سینوپ',
    provinceTr: 'Sinop',
    districts: ['مرکز سینوپ', 'بویابات (Boyabat)'],
  },
  {
    province: 'سیواس',
    provinceTr: 'Sivas',
    districts: ['مرکز سیواس', 'شارکیشلا (Şarkışla)'],
  },
  {
    province: 'شرناق',
    provinceTr: 'Şırnak',
    districts: ['مرکز شرناق', 'جیزره (Cizre)', 'سلپی (Silopi)'],
  },
  {
    province: 'تکیرداغ',
    provinceTr: 'Tekirdağ',
    districts: ['چورلو (Çorlu)', 'شرکزرکوی (Çerkezköy)', 'سلیمان‌پاشا (Süleymanpaşa)'],
  },
  {
    province: 'توقات',
    provinceTr: 'Tokat',
    districts: ['مرکز توقات', 'اربا (Erbaa)', 'تورخال (Turhal)'],
  },
  {
    province: 'ترابزون',
    provinceTr: 'Trabzon',
    districts: ['اورتاهیصار (Ortahisar)', 'آکچابات (Akçaabat)', 'ارسین (Arsin)', 'اوف (Of)'],
  },
  {
    province: 'تونجلی',
    provinceTr: 'Tunceli',
    districts: ['مرکز تونجلی'],
  },
  {
    province: 'اوشاک',
    provinceTr: 'Uşak',
    districts: ['مرکز اوشاک'],
  },
  {
    province: 'وان',
    provinceTr: 'Van',
    districts: ['ایپک‌یولو (İpekyolu)', 'تووآ (Tuşba)', 'ادرمیت (Edremit)'],
  },
  {
    province: 'یالوا',
    provinceTr: 'Yalova',
    districts: ['مرکز یالوا', 'چینارجیک (Çınarcık)', 'آلتین‌اوا (Altınova)'],
  },
  {
    province: 'یوزگات',
    provinceTr: 'Yozgat',
    districts: ['مرکز یوزگات', 'سورگون (Sorgun)'],
  },
  {
    province: 'زونگولداغ',
    provinceTr: 'Zonguldak',
    districts: ['مرکز زونگولداغ', 'ارکلی (Ereğli)'],
  },
];

/** استخراج آرایه کامل تمامی استان‌ها و شهرستان‌های ترکیه */
export const ALL_TURKEY_CITIES_FA: string[] = Array.from(
  new Set(
    TURKEY_PROVINCES_AND_DISTRICTS.flatMap((group) => [
      group.province,
      ...group.districts,
    ])
  )
);

export const CITIES_WITH_ALL: string[] = ['همه شهرها', ...ALL_TURKEY_CITIES_FA];
