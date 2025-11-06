import { formatDate, formatDateShort, getRelativeTime } from '../../src/utils/date';

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('should format date to readable string', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const formatted = formatDate(date);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('January');
      expect(formatted).toContain('15');
    });

    it('should handle string input', () => {
      const formatted = formatDate('2024-01-15');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatDateShort', () => {
    it('should format date to short string', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const formatted = formatDateShort(date);
      expect(formatted).toContain('2024');
      expect(formatted).toContain('Jan');
    });
  });

  describe('getRelativeTime', () => {
    it('should return "Just now" for very recent dates', () => {
      const date = new Date();
      expect(getRelativeTime(date)).toBe('Just now');
    });

    it('should return minutes ago for recent dates', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      const relative = getRelativeTime(date);
      expect(relative).toContain('minute');
    });

    it('should return hours ago for dates within a day', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
      const relative = getRelativeTime(date);
      expect(relative).toContain('hour');
    });

    it('should return days ago for recent dates', () => {
      const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const relative = getRelativeTime(date);
      expect(relative).toContain('day');
    });

    it('should return formatted date for old dates', () => {
      const date = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000); // 40 days ago
      const relative = getRelativeTime(date);
      // Should be formatted date, not relative
      expect(relative).not.toContain('day');
    });
  });
});
