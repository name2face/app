/**
 * Application constants
 */

// Quick tags available for tagging persons
export const QUICK_TAGS = ['Work', 'Social', 'Event', 'Service', 'Hobby'] as const;

// Gender options
export const GENDER_OPTIONS = [
  { label: 'Prefer not to specify', value: null },
  { label: 'Female', value: 'Female' as const },
  { label: 'Male', value: 'Male' as const },
  { label: 'Other', value: 'Other' as const },
] as const;

// Search relevance score weights
export const SEARCH_WEIGHTS = {
  NAME_EXACT_MATCH: 150,
  NAME_STARTS_WITH: 125,
  NAME_CONTAINS: 100,
  MEMORY_HOOKS: 30,
  TAGS: 20,
  GENDER: 10,
} as const;

// Validation constraints
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 100,
  MAX_MEMORY_HOOKS_LENGTH: 5000,
} as const;

// Colors (matching the UI design)
export const COLORS = {
  PRIMARY: '#007AFF',
  SUCCESS: '#34C759',
  DANGER: '#FF3B30',
  WARNING: '#FF9500',
  SECONDARY: '#8E8E93',
  BACKGROUND: '#f5f5f5',
  CARD_BACKGROUND: '#ffffff',
  TEXT_PRIMARY: '#333333',
  TEXT_SECONDARY: '#666666',
  TEXT_TERTIARY: '#999999',
  BORDER: '#dddddd',
  TAG_BACKGROUND: '#E8F4FF',
} as const;
