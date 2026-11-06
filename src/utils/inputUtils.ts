/**
 * Karbama Input & Keyboard Utilities
 * - Converts Persian & Arabic digits to standard ASCII English digits (0-9)
 * - Restricts numeric inputs from accepting Persian numerals
 * - Provides sanitizers for National ID/Passport, Phone number, and Bank card numbers
 */

/**
 * Replaces all Persian (۰-۹) and Arabic (٠-٩) digits with standard ASCII digits (0-9)
 */
export const toEnglishDigits = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/[۰٠]/g, '0')
    .replace(/[۱١]/g, '1')
    .replace(/[۲٢]/g, '2')
    .replace(/[۳٣]/g, '3')
    .replace(/[۴٤]/g, '4')
    .replace(/[۵٥]/g, '5')
    .replace(/[۶٦]/g, '6')
    .replace(/[۷٧]/g, '7')
    .replace(/[۸٨]/g, '8')
    .replace(/[۹٩]/g, '9');
};

/**
 * Strips all non-digit characters and ensures only ASCII 0-9 digits remain
 */
export const sanitizeNumericOnly = (val: string, maxLen?: number): string => {
  if (!val) return '';
  const converted = toEnglishDigits(val).replace(/\D/g, '');
  return maxLen ? converted.slice(0, maxLen) : converted;
};

/**
 * Formats a 16-digit card number with dashes (e.g. 6037-9975-1234-5678)
 * strictly using English digits
 */
export const sanitizeCardNumber = (val: string): string => {
  const digits = sanitizeNumericOnly(val, 16);
  return digits.match(/.{1,4}/g)?.join('-') || digits;
};

/**
 * Sanitizes National ID or Passport Number:
 * - Converts Persian/Arabic digits to 0-9
 * - Allows only English letters (A-Z) and digits (0-9)
 * - Converts letters to uppercase, max length 15
 */
export const sanitizeNationalIdOrPassport = (val: string): string => {
  if (!val) return '';
  const converted = toEnglishDigits(val);
  return converted.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15);
};

/**
 * Normalizes phone numbers for duplicate comparison (removes spaces, dashes, leading zero, etc.)
 */
export const normalizePhoneForComparison = (val: string): string => {
  const digits = sanitizeNumericOnly(val);
  // Match the last 10 digits (e.g. 9123456789 from +989123456789 or 09123456789)
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

/**
 * Normalizes bank card number for duplicate comparison (digits only)
 */
export const normalizeCardForComparison = (val: string): string => {
  return sanitizeNumericOnly(val);
};

/**
 * Normalizes national ID / passport for duplicate comparison
 */
export const normalizeNationalIdForComparison = (val: string): string => {
  return sanitizeNationalIdOrPassport(val).trim();
};

/**
 * Normalizes email for duplicate comparison
 */
export const normalizeEmailForComparison = (val: string): string => {
  return (val || '').trim().toLowerCase();
};
