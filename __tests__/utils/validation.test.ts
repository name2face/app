import {
  isValidEmail,
  isValidPassword,
  isValidName,
  getEmailError,
  getPasswordError,
  getNameError,
} from '../../src/utils/validation';

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.com')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for passwords with 6+ characters', () => {
      expect(isValidPassword('123456')).toBe(true);
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('abc123')).toBe(true);
    });

    it('should return false for passwords with less than 6 characters', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('12345')).toBe(false);
      expect(isValidPassword('abc')).toBe(false);
    });
  });

  describe('isValidName', () => {
    it('should return true for non-empty names', () => {
      expect(isValidName('John Doe')).toBe(true);
      expect(isValidName('Jane')).toBe(true);
      expect(isValidName('  John  ')).toBe(true); // Whitespace is trimmed
    });

    it('should return false for empty names', () => {
      expect(isValidName('')).toBe(false);
      expect(isValidName('   ')).toBe(false);
    });
  });

  describe('getEmailError', () => {
    it('should return null for valid emails', () => {
      expect(getEmailError('test@example.com')).toBeNull();
    });

    it('should return error message for empty email', () => {
      expect(getEmailError('')).toBe('Email is required');
    });

    it('should return error message for invalid email', () => {
      expect(getEmailError('invalid')).toBe('Please enter a valid email address');
    });
  });

  describe('getPasswordError', () => {
    it('should return null for valid passwords', () => {
      expect(getPasswordError('password123')).toBeNull();
    });

    it('should return error message for empty password', () => {
      expect(getPasswordError('')).toBe('Password is required');
    });

    it('should return error message for short password', () => {
      expect(getPasswordError('12345')).toBe('Password must be at least 6 characters');
    });
  });

  describe('getNameError', () => {
    it('should return null for valid names', () => {
      expect(getNameError('John Doe')).toBeNull();
    });

    it('should return error message for empty name', () => {
      expect(getNameError('')).toBe('Name is required');
      expect(getNameError('   ')).toBe('Name is required');
    });
  });
});
