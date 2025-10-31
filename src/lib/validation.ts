/**
 * Form validation utilities
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  if (email.length < 3) {
    return { valid: false, error: 'Email must be at least 3 characters' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
}

/**
 * Password validation
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 100) {
    return { valid: false, error: 'Password must be less than 100 characters' };
  }

  return { valid: true };
}

/**
 * Name validation
 */
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (name.trim().length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters` };
  }

  if (name.length > 100) {
    return { valid: false, error: `${fieldName} must be less than 100 characters` };
  }

  return { valid: true };
}

/**
 * Phone number validation (basic - 10 digits)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }

  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');

  if (!/^\d{10}$/.test(cleaned)) {
    return { valid: false, error: 'Please enter a valid 10-digit phone number' };
  }

  return { valid: true };
}

/**
 * ID number validation (Aadhaar/PAN - basic check)
 */
export function validateIdNumber(idNumber: string): ValidationResult {
  if (!idNumber) {
    return { valid: false, error: 'ID number is required' };
  }

  const cleaned = idNumber.replace(/\s/g, '');

  // Check for Aadhaar (12 digits) or PAN (10 alphanumeric)
  const isAadhaar = /^\d{12}$/.test(cleaned);
  const isPAN = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleaned.toUpperCase());

  if (!isAadhaar && !isPAN) {
    return {
      valid: false,
      error: 'Please enter a valid Aadhaar (12 digits) or PAN number',
    };
  }

  return { valid: true };
}

/**
 * Address validation
 */
export function validateAddress(address: string): ValidationResult {
  if (!address || address.trim().length === 0) {
    return { valid: false, error: 'Address is required' };
  }

  if (address.trim().length < 10) {
    return { valid: false, error: 'Address must be at least 10 characters' };
  }

  if (address.length > 500) {
    return { valid: false, error: 'Address must be less than 500 characters' };
  }

  return { valid: true };
}

/**
 * Required field validation
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }

  return { valid: true };
}
