/**
 * Validation utilities for Karbama Application
 * Enforces strict real-world validation for phone numbers, Iranian Shetab bank cards (BIN + Luhn),
 * Iranian National IDs (Mod-11), emails, and passwords.
 */

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmed = (email || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'لطفاً آدرس ایمیل خود را وارد نمایید.' };
  }

  // Strict RFC-compliant email structure
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,12}$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'فرمت ایمیل نامعتبر است (مثال صحیح: name@gmail.com).',
    };
  }

  const [localPart, domainPart] = trimmed.toLowerCase().split('@');
  if (
    !localPart ||
    localPart.length < 2 ||
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..')
  ) {
    return {
      isValid: false,
      error: 'بخش نام کاربری ایمیل (قبل از @) نامعتبر است.',
    };
  }

  // Reject repeated single-character local parts like aaaa@gmail.com or 1111@gmail.com
  if (/^(.)\1{3,}$/.test(localPart)) {
    return {
      isValid: false,
      error: 'آدرس ایمیل وارد شده ساختگی است. لطفاً ایمیل واقعی خود را وارد نمایید.',
    };
  }

  const domainPieces = domainPart.split('.');
  const domainName = domainPieces.slice(0, -1).join('.');
  const tld = domainPieces[domainPieces.length - 1];

  if (
    !domainName ||
    domainName.length < 2 ||
    /^\d+$/.test(domainName) ||
    domainPart.includes('..') ||
    domainName.startsWith('-') ||
    domainName.endsWith('-') ||
    !tld ||
    tld.length < 2
  ) {
    return {
      isValid: false,
      error: 'دامنه ایمیل وارد شده معتبر نیست (مثلاً @gmail.com یا @yahoo.com).',
    };
  }

  const blockedFakeDomains = [
    'test.com',
    'example.com',
    'fake.com',
    'asdf.com',
    'qwerty.com',
    'aaa.com',
    'bbb.com',
    'abc.com',
    '123.com',
  ];
  if (blockedFakeDomains.includes(domainPart)) {
    return {
      isValid: false,
      error: 'این دامنه ایمیل ساختگی است. لطفاً یک آدرس ایمیل واقعی وارد کنید.',
    };
  }

  return { isValid: true };
}

export function isValidEmail(email: string): boolean {
  return validateEmail(email).isValid;
}

export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasUpper?: boolean;
  hasLower?: boolean;
  hasDigit?: boolean;
  error?: string;
}

export function checkPasswordStrength(password: string): PasswordValidationResult {
  const pwd = password || '';
  const hasMinLength = pwd.length >= 8;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasLowercase = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  let error: string | undefined = undefined;
  if (!hasMinLength) {
    error = 'رمز عبور باید حداقل ۸ کاراکتر باشد.';
  } else if (!hasUppercase) {
    error = 'رمز عبور باید حداقل شامل یک حرف بزرگ انگلیسی (A-Z) باشد.';
  } else if (!hasLowercase) {
    error = 'رمز عبور باید حداقل شامل یک حرف کوچک انگلیسی (a-z) باشد.';
  } else if (!hasNumber) {
    error = 'رمز عبور باید حداقل شامل یک عدد انگلیسی (0-9) باشد.';
  }

  return {
    isValid,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasUpper: hasUppercase,
    hasLower: hasLowercase,
    hasDigit: hasNumber,
    error,
  };
}

/**
 * Normalize Persian/Arabic digits to English digits
 */
function toCleanDigits(input: string): string {
  if (!input) return '';
  return input
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/\D/g, '');
}

/**
 * Official Iranian Shaparak Bank BIN Prefixes
 */
export const IRANIAN_BANK_BINS: Record<string, string> = {
  '603799': 'بانک ملی ایران',
  '610433': 'بانک ملت',
  '991975': 'بانک ملت',
  '621986': 'بانک سامان (بلوبانک)',
  '502229': 'بانک پاسارگاد',
  '639347': 'بانک پاسارگاد',
  '627353': 'بانک تجارت',
  '585983': 'بانک تجارت',
  '589210': 'بانک سپه',
  '627381': 'بانک انصار (سپه)',
  '505801': 'موسسه کوثر (سپه)',
  '639599': 'بانک قوامین (سپه)',
  '639370': 'بانک مهر اقتصاد (سپه)',
  '507677': 'موسسه نور',
  '627412': 'بانک اقتصاد نوین',
  '622106': 'بانک پارسیان',
  '639194': 'بانک پارسیان',
  '627884': 'بانک پارسیان',
  '504706': 'بانک شهر',
  '502806': 'بانک شهر',
  '603770': 'بانک کشاورزی',
  '639217': 'بانک کشاورزی',
  '628023': 'بانک مسکن',
  '502908': 'بانک توسعه تعاون',
  '639346': 'بانک سینا',
  '639607': 'بانک سرمایه',
  '636214': 'بانک آینده',
  '505785': 'بانک ایران زمین',
  '606373': 'بانک قرض‌الحسنه مهر ایران',
  '504172': 'بانک قرض‌الحسنه رسالت',
  '603769': 'بانک صادرات ایران',
  '505416': 'بانک گردشگری',
  '627488': 'بانک کارآفرین',
  '502910': 'بانک کارآفرین',
  '627961': 'بانک صنعت و معدن',
  '636795': 'بانک مرکزی',
  '627760': 'پست بانک ایران',
  '505809': 'بانک خاورمیانه',
  '589463': 'بانک رفاه کارگران',
  '502938': 'بانک دی',
  '606256': 'موسسه اعتباری ملل',
  '628157': 'موسسه اعتباری توسعه',
};

/**
 * Validates a 16-digit Bank Card using:
 * 1. Exact 16-digit length
 * 2. Anti-fake / anti-repeated / anti-sequential digit check
 * 3. Official Shaparak Bank 6-digit BIN prefix verification
 * 4. ISO/IEC 7812 Luhn Checksum Algorithm (Mod-10)
 */
export function validateIranianBankCard(cardNumber: string): {
  isValid: boolean;
  bankName?: string;
  error?: string;
} {
  const digits = toCleanDigits(cardNumber);

  if (!digits) {
    return {
      isValid: false,
      error: 'لطفاً شماره کارت بانکی ۱۶ رقمی را وارد نمایید.',
    };
  }

  if (digits.length !== 16) {
    return {
      isValid: false,
      error: `شماره کارت بانکی باید دقیقاً ۱۶ رقم باشد (${digits.length} رقم وارد شده است).`,
    };
  }

  // Reject repeated digits (e.g., 1111111111111111, 6037991111111111)
  if (/^(\d)\1{15}$/.test(digits) || /(\d)\1{6,}/.test(digits)) {
    return {
      isValid: false,
      error: 'شماره کارت وارد شده ساختگی است (ارقام تکراری غیرمجاز). لطفاً شماره کارت واقعی بانکی را وارد کنید.',
    };
  }

  // Reject sequential patterns
  if (
    digits.includes('12345678') ||
    digits.includes('87654321') ||
    digits.includes('01234567') ||
    digits.includes('23456789')
  ) {
    return {
      isValid: false,
      error: 'شماره کارت وارد شده واقعی نیست (ارقام متوالی ساختگی). لطفاً شماره کارت معتبر بانکی وارد نمایید.',
    };
  }

  const bin = digits.slice(0, 6);
  const bankName = IRANIAN_BANK_BINS[bin];
  if (!bankName) {
    return {
      isValid: false,
      error: `پیش‌شماره کارت (${bin}) متعلق به هیچ‌یک از بانک‌های رسمی شبکه شتاب نیست. لطفاً شماره کارت واقعی وارد کنید.`,
    };
  }

  // Luhn Checksum Algorithm (Mod-10)
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    let d = parseInt(digits[i], 10);
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }

  if (sum % 10 !== 0) {
    return {
      isValid: false,
      bankName,
      error: `شماره کارت ${bankName} از نظر الگوریتم Luhn شاپرک نامعتبر است (یک یا چند رقم اشتباه وارد شده است).`,
    };
  }

  return {
    isValid: true,
    bankName,
  };
}

/**
 * Validates customer mobile phone number (Iran 09... / +98, Turkey +90, and international)
 * Strictly enforces Iranian mobile prefixes (091x, 093x, 090x, 092x, 099x) and blocks fake/repeated/sequential numbers.
 */
export function validatePhoneNumber(
  rawPhone: string,
  countryCode: string = '+98'
): {
  isValid: boolean;
  operatorName?: string;
  error?: string;
} {
  const rawTrimmed = (rawPhone || '').trim();
  let digits = toCleanDigits(rawTrimmed);
  if (!digits) {
    return { isValid: false, error: 'لطفاً شماره موبایل معتبر خود را وارد نمایید (مثال: 09123456789).' };
  }

  // Detect if user explicitly typed +90 / 0090 in a single phone field
  let effectiveCountry = countryCode;
  if (rawTrimmed.startsWith('+90') || digits.startsWith('0090')) {
    effectiveCountry = '+90';
    digits = digits.replace(/^(0090|90)/, '');
  } else if (rawTrimmed.startsWith('+98') || digits.startsWith('0098')) {
    effectiveCountry = '+98';
    digits = digits.replace(/^(0098|98)/, '');
  } else if (effectiveCountry === '+98' && digits.startsWith('98') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (effectiveCountry === '+90' && digits.startsWith('90') && digits.length === 12) {
    digits = digits.slice(2);
  }

  // Strip leading zero for normalized analysis
  const withoutLeadingZero = digits.startsWith('0') ? digits.slice(1) : digits;

  // Reject repeated digits (e.g., 9121111111, 9120000000, 9129999999)
  if (/^(\d)\1{5,}$/.test(withoutLeadingZero) || /(\d)\1{5,}/.test(withoutLeadingZero)) {
    return {
      isValid: false,
      error: 'شماره موبایل وارد شده ساختگی است (ارقام تکراری غیرمجاز). لطفاً شماره موبایل واقعی وارد کنید.',
    };
  }

  // Reject sequential digits (e.g., 1234567, 7654321, 123456)
  if (
    withoutLeadingZero.includes('123456') ||
    withoutLeadingZero.includes('654321') ||
    withoutLeadingZero.includes('012345') ||
    withoutLeadingZero.includes('234567') ||
    withoutLeadingZero.includes('345678') ||
    withoutLeadingZero.includes('456789') ||
    withoutLeadingZero.includes('987654')
  ) {
    return {
      isValid: false,
      error: 'شماره موبایل وارد شده ساختگی است (ارقام متوالی). لطفاً شماره موبایل واقعی خود را وارد نمایید.',
    };
  }

  // Require at least 3 distinct digits in the subscriber number (last 7 digits)
  const subscriberPart = withoutLeadingZero.slice(-7);
  const uniqueDigits = new Set(subscriberPart.split('')).size;
  if (subscriberPart.length === 7 && uniqueDigits < 3) {
    return {
      isValid: false,
      error: 'شماره موبایل وارد شده معتبر نیست. لطفاً یک شماره تماس واقعی و فعال وارد نمایید.',
    };
  }

  // 1. Iran (+98) Strict Mobile Validation (must start with 09 or 9 and valid operator prefix)
  if (effectiveCountry === '+98') {
    if (!withoutLeadingZero.startsWith('9')) {
      return {
        isValid: false,
        error: 'شماره موبایل ایران باید حتماً با پیش‌شماره 09 شروع شود (مثلاً 0912...).',
      };
    }

    if (withoutLeadingZero.length !== 10) {
      return {
        isValid: false,
        error: 'شماره موبایل ایران باید ۱۱ رقم با صفر اول (09XXXXXXXXX) یا ۱۰ رقم بدون صفر اول باشد.',
      };
    }

    const prefix3 = withoutLeadingZero.slice(0, 3);
    const validIranMobilePrefixes: Record<string, string> = {
      // MCI (همراه اول)
      '910': 'همراه اول',
      '911': 'همراه اول',
      '912': 'همراه اول',
      '913': 'همراه اول',
      '914': 'همراه اول',
      '915': 'همراه اول',
      '916': 'همراه اول',
      '917': 'همراه اول',
      '918': 'همراه اول',
      '919': 'همراه اول',
      '990': 'همراه اول',
      '991': 'همراه اول',
      '992': 'همراه اول',
      '993': 'همراه اول',
      '994': 'همراه اول',
      '996': 'همراه اول',
      // Irancell (ایرانسل)
      '930': 'ایرانسل',
      '933': 'ایرانسل',
      '935': 'ایرانسل',
      '936': 'ایرانسل',
      '937': 'ایرانسل',
      '938': 'ایرانسل',
      '939': 'ایرانسل',
      '900': 'ایرانسل',
      '901': 'ایرانسل',
      '902': 'ایرانسل',
      '903': 'ایرانسل',
      '904': 'ایرانسل',
      '905': 'ایرانسل',
      // Rightel (رایتل)
      '920': 'رایتل',
      '921': 'رایتل',
      '922': 'رایتل',
      '923': 'رایتل',
      // MVNOs (شاتل موبایل، سامانتل و ...)
      '998': 'شاتل موبایل',
      '999': 'اپراتور مجازی',
    };

    const operatorName = validIranMobilePrefixes[prefix3];
    if (!operatorName) {
      return {
        isValid: false,
        error: `پیش‌شماره موبایل (0${prefix3}) معتبر نیست. لطفاً پیش‌شماره معتبر (همراه اول، ایرانسل یا رایتل) وارد کنید.`,
      };
    }

    return { isValid: true, operatorName };
  }

  // 2. Turkey (+90) Validation
  if (effectiveCountry === '+90') {
    if (withoutLeadingZero.length !== 10) {
      return {
        isValid: false,
        error: 'شماره موبایل ترکیه باید دقیقاً ۱۰ رقم باشد (مثلاً 532XXXXXXX).',
      };
    }
    const trPrefix3 = withoutLeadingZero.slice(0, 3);
    const prefixNum = parseInt(trPrefix3, 10);
    const isValidTurkcell = prefixNum >= 530 && prefixNum <= 539;
    const isValidVodafone = prefixNum >= 540 && prefixNum <= 549;
    const isValidTurkTelekom = (prefixNum >= 501 && prefixNum <= 507) || (prefixNum >= 551 && prefixNum <= 559);
    const isValidNetgsm = prefixNum === 516 || prefixNum === 561;

    if (!isValidTurkcell && !isValidVodafone && !isValidTurkTelekom && !isValidNetgsm) {
      return {
        isValid: false,
        error: `پیش‌شماره (${trPrefix3}) متعلق به اپراتورهای موبایل ترکیه (53x, 54x, 50x, 55x) نیست.`,
      };
    }
    return { isValid: true, operatorName: 'اپراتور ترکیه' };
  }

  // 3. Other supported countries (+49 Germany, +964 Iraq, +374 Armenia, +971 UAE, +44 UK)
  if (withoutLeadingZero.length < 8 || withoutLeadingZero.length > 12) {
    return {
      isValid: false,
      error: 'تعداد ارقام شماره تلفن وارد شده با استاندارد کشور انتخابی مطابقت ندارد.',
    };
  }

  return { isValid: true };
}

/**
 * Validates strict 10-digit Iranian National ID (کد ملی) using official Mod-11 Checksum Algorithm
 */
export function validateIranianNationalId(input: string): {
  isValid: boolean;
  error?: string;
} {
  const digits = toCleanDigits(input);
  if (!digits) {
    return {
      isValid: false,
      error: 'لطفاً کد ملی ۱۰ رقمی خود را وارد نمایید.',
    };
  }

  if (digits.length !== 10) {
    return {
      isValid: false,
      error: `کد ملی ایران باید دقیقاً ۱۰ رقم باشد (${digits.length} رقم وارد شده است).`,
    };
  }

  // Reject all-same digits (e.g., 1111111111, 0000000000) or 7+ repeated digits
  if (/^(\d)\1{9}$/.test(digits) || /(\d)\1{6,}/.test(digits)) {
    return {
      isValid: false,
      error: 'کد ملی وارد شده ساختگی است (ارقام تکراری). لطفاً کد ملی واقعی خود را وارد نمایید.',
    };
  }

  // Reject known sequential patterns that happen to satisfy mod-11 mathematically
  const fakeSequentials = ['0123456789', '1234567891', '9876543210', '0012345679'];
  if (fakeSequentials.includes(digits) || digits.includes('1234567') || digits.includes('7654321')) {
    return {
      isValid: false,
      error: 'کد ملی وارد شده ساختگی است (ارقام متوالی). لطفاً کد ملی حقیقی خود را وارد نمایید.',
    };
  }

  const check = parseInt(digits[9], 10);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * (10 - i);
  }
  const remainder = sum % 11;
  const isValidMod11 =
    (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder);

  if (!isValidMod11) {
    return {
      isValid: false,
      error: 'کد ملی وارد شده در الگوریتم رسمی ثبت احوال نامعتبر است. لطفاً کد ملی ۱۰ رقمی صحیح را وارد کنید.',
    };
  }

  return { isValid: true };
}

/**
 * Validates Iranian 10-digit National ID (کد ملی) using official Mod-11 Checksum Algorithm
 */
export function validateNationalIdOrPassport(input: string): {
  isValid: boolean;
  error?: string;
} {
  return validateIranianNationalId(input);
}

