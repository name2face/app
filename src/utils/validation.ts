/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requires at least 6 characters
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Validate name (non-empty after trimming)
 */
export const isValidName = (name: string): boolean => {
  return name.trim().length > 0;
};

/**
 * Get validation errors for email
 */
export const getEmailError = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (!isValidEmail(email)) return 'Please enter a valid email address';
  return null;
};

/**
 * Get validation errors for password
 */
export const getPasswordError = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (!isValidPassword(password)) return 'Password must be at least 6 characters';
  return null;
};

/**
 * Get validation errors for name
 */
export const getNameError = (name: string): string | null => {
  if (!isValidName(name)) return 'Name is required';
  return null;
};
