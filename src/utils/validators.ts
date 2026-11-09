/**
 * Validation utilities for Karbama Application
 * Enforces strict real-world validation for phone numbers, Iranian Shetab bank cards (BIN + Luhn),
 * Iranian National IDs (Mod-11), emails, and passwords.
 */

export function isValidEmail(email: string): boolean {
  if (!email || !email.trim()) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
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
  '621986': 'بانک سامان',
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
 * Validates a 16-digit Iranian Shetab Bank Card using:
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

  if (!digits || digits.length !== 16) {
    return {
      isValid: false,
      error: 'شماره کارت بانکی نامعتبر است؛ شماره کارت باید دقیقاً ۱۶ رقم باشد.',
    };
  }

  // Reject repeated digits (e.g., 1111111111111111, 6037991111111111)
  if (/^(\d)\1{15}$/.test(digits) || /(\d)\1{7,}/.test(digits)) {
    return {
      isValid: false,
      error: 'شماره کارت وارد شده ساختگی است (ارقام تکراری غیرمجاز). لطفاً شماره کارت واقعی بانکی را وارد کنید.',
    };
  }

  // Reject sequential patterns
  if (digits.includes('12345678') || digits.includes('87654321') || digits.includes('01234567')) {
    return {
      isValid: false,
      error: 'شماره کارت وارد شده واقعی نیست. لطفاً شماره کارت معتبر بانکی عضو شبکه شتاب وارد نمایید.',
    };
  }

  const bin = digits.slice(0, 6);
  const bankName = IRANIAN_BANK_BINS[bin];
  if (!bankName) {
    return {
      isValid: false,
      error: `پیش‌شماره کارت (${bin}) متعلق به هیچ‌یک از بانک‌های رسمی عضو شبکه شتاب ایران نیست. لطفاً شماره کارت واقعی وارد کنید.`,
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
      error: `شماره کارت ${bankName} وارد شده از نظر الگوریتم شاپرک نامعتبر است (یک یا چند رقم اشتباه تایپ شده است).`,
    };
  }

  return {
    isValid: true,
    bankName,
  };
}

/**
 * Validates customer phone number (Iran +98, Turkey +90, and international)
 * Rejects fake, repeated, sequential, or invalid-prefix phone numbers.
 */
export function validatePhoneNumber(
  rawPhone: string,
  countryCode: string = '+98'
): {
  isValid: boolean;
  operatorName?: string;
  error?: string;
} {
  let digits = toCleanDigits(rawPhone);
  if (!digits) {
    return { isValid: false, error: 'لطفاً شماره تلفن همراه خود را وارد نمایید.' };
  }

  // Strip country code if user typed it inside the phone field
  if (countryCode === '+98' && digits.startsWith('98') && digits.length >= 12) {
    digits = digits.slice(2);
  } else if (countryCode === '+90' && digits.startsWith('90') && digits.length >= 12) {
    digits = digits.slice(2);
  }

  // Strip leading zero for normalized analysis
  const withoutLeadingZero = digits.startsWith('0') ? digits.slice(1) : digits;

  // Reject repeated digits (e.g., 9121111111, 9120000000, 5322222222)
  if (/^(\d)\1{6,}$/.test(withoutLeadingZero) || /(\d)\1{6,}/.test(withoutLeadingZero)) {
    return {
      isValid: false,
      error: 'شماره تلفن وارد شده غیرواقعی است (استفاده از ارقام تکراری). لطفاً شماره تماس واقعی خود را وارد کنید.',
    };
  }

  // Reject sequential digits (e.g., 1234567, 7654321)
  if (
    withoutLeadingZero.includes('1234567') ||
    withoutLeadingZero.includes('7654321') ||
    withoutLeadingZero.includes('0123456') ||
    withoutLeadingZero.includes('2345678') ||
    withoutLeadingZero.includes('3456789')
  ) {
    return {
      isValid: false,
      error: 'شماره تلفن وارد شده ساختگی است (ارقام متوالی). لطفاً شماره تلفن واقعی خود را وارد نمایید.',
    };
  }

  // Require at least 3 distinct digits in the subscriber number (last 7 digits)
  const subscriberPart = withoutLeadingZero.slice(-7);
  const uniqueDigits = new Set(subscriberPart.split('')).size;
  if (uniqueDigits < 3) {
    return {
      isValid: false,
      error: 'شماره تلفن وارد شده معتبر نیست. لطفاً یک شماره تلفن واقعی و فعال وارد نمایید.',
    };
  }

  // 1. Iran (+98) Validation
  if (countryCode === '+98' || digits.startsWith('09') || (digits.length === 10 && digits.startsWith('9'))) {
    if (withoutLeadingZero.length !== 10) {
      return {
        isValid: false,
        error: 'شماره موبایل ایران باید ۱۰ رقم (بدون صفر اول، مثلاً 912XXXXXXX) یا ۱۱ رقم با صفر اول باشد.',
      };
    }

    const prefix3 = withoutLeadingZero.slice(0, 3);
    const validIranMobilePrefixes = [
      // MCI (Hamrah-e Aval)
      '910', '911', '912', '913', '914', '915', '916', '917', '918', '919',
      '990', '991', '992', '993', '994', '996',
      // Irancell
      '930', '933', '935', '936', '937', '938', '939',
      '900', '901', '902', '903', '904', '905',
      // Rightel
      '920', '921', '922', '923',
      // MVNOs (Shatel, Samantel, Aptel, Azartel)
      '998', '999',
    ];

    const prefix2 = withoutLeadingZero.slice(0, 2);
    const validIranLandlinePrefixes = [
      '21', '26', '31', '41', '51', '61', '71', '11', '13', '17', '23', '24', '25',
      '28', '34', '35', '38', '44', '45', '54', '56', '58', '66', '74', '76', '77',
      '81', '83', '84', '86', '87',
    ];

    if (withoutLeadingZero.startsWith('9')) {
      if (!validIranMobilePrefixes.includes(prefix3)) {
        return {
          isValid: false,
          error: `پیش‌شماره موبایل (0${prefix3}) در اپراتورهای ایران (همراه اول، ایرانسل، رایتل) وجود ندارد. لطفاً شماره واقعی وارد کنید.`,
        };
      }
      return { isValid: true };
    } else if (validIranLandlinePrefixes.includes(prefix2)) {
      return { isValid: true };
    } else {
      return {
        isValid: false,
        error: 'پیش‌شماره تلفن وارد شده متعلق به شبکه مخابرات ایران نیست.',
      };
    }
  }

  // 2. Turkey (+90) Validation
  if (countryCode === '+90') {
    if (withoutLeadingZero.length !== 10) {
      return {
        isValid: false,
        error: 'شماره تلفن ترکیه باید دقیقاً ۱۰ رقم باشد (مثلاً 532XXXXXXX).',
      };
    }
    const trPrefix3 = withoutLeadingZero.slice(0, 3);
    const prefixNum = parseInt(trPrefix3, 10);
    const isValidTurkcell = prefixNum >= 530 && prefixNum <= 539;
    const isValidVodafone = prefixNum >= 540 && prefixNum <= 549;
    const isValidTurkTelekom = (prefixNum >= 501 && prefixNum <= 507) || (prefixNum >= 551 && prefixNum <= 559);
    const isValidNetgsm = prefixNum === 516 || prefixNum === 561;
    const isValidTrLandline = ['212', '216', '312', '232', '242', '224', '322', '342', '352', '362'].includes(trPrefix3);

    if (!isValidTurkcell && !isValidVodafone && !isValidTurkTelekom && !isValidNetgsm && !isValidTrLandline) {
      return {
        isValid: false,
        error: `پیش‌شماره (${trPrefix3}) متعلق به اپراتورهای رسمی ترکیه (Turkcell, Vodafone, Türk Telekom) نیست.`,
      };
    }
    return { isValid: true };
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
 * Validates Iranian 10-digit National ID (کد ملی) or Passport Number
 */
export function validateNationalIdOrPassport(input: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = (input || '').trim();
  if (!trimmed || trimmed.length < 6) {
    return {
      isValid: false,
      error: 'کد ملی (۱۰ رقم) یا شماره پاسپورت معتبر الزامی است.',
    };
  }

  // If input contain letters (Passport number like A12345678), validate passport format
  if (/[A-Za-z]/.test(trimmed)) {
    const cleanPass = trimmed.replace(/\s+/g, '');
    if (!/^[A-Za-z]{1,2}\d{6,9}$/.test(cleanPass)) {
      return {
        isValid: false,
        error: 'فرمت شماره پاسپورت نامعتبر است (باید شامل ۱ یا ۲ حرف انگلیسی و ۶ تا ۹ رقم باشد).',
      };
    }
    const passDigits = cleanPass.replace(/\D/g, '');
    if (/^(\d)\1{5,}$/.test(passDigits)) {
      return {
        isValid: false,
        error: 'شماره پاسپورت وارد شده غیرواقعی است.',
      };
    }
    return { isValid: true };
  }

  // Pure numeric -> Must be a valid 10-digit Iranian National ID (کد ملی)
  const digits = toCleanDigits(trimmed);
  if (digits.length !== 10) {
    return {
      isValid: false,
      error: 'کد ملی ایران باید دقیقاً ۱۰ رقم باشد.',
    };
  }

  // Reject all-same digits (e.g., 1111111111, 0000000000)
  if (/^(\d)\1{9}$/.test(digits)) {
    return {
      isValid: false,
      error: 'کد ملی وارد شده ساختگی و نامعتبر است.',
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
      error: 'کد ملی وارد شده معتبر نیست (کد ملی حقیقی نمی‌باشد). لطفاً کد ملی ۱۰ رقمی صحیح خود را وارد نمایید.',
    };
  }

  return { isValid: true };
}
