/**
 * Validation utilities for Karbama Application
 * Enforces security requirements and user input formats.
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
