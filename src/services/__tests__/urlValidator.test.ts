import { URLValidator } from '../urlValidator';

describe('URLValidator', () => {
  describe('validate', () => {
    it('validates allowed domains', () => {
      expect(URLValidator.validate('https://itch.io/game')).toBe(true);
      expect(URLValidator.validate('https://subdomain.itch.io/game')).toBe(true);
      expect(URLValidator.validate('https://github.io/user/repo')).toBe(true);
      expect(URLValidator.validate('https://codepen.io/pen/abc123')).toBe(true);
      expect(URLValidator.validate('https://replit.com/@user/project')).toBe(true);
      expect(URLValidator.validate('https://glitch.com/~project')).toBe(true);
      expect(URLValidator.validate('https://scratch.mit.edu/projects/123')).toBe(true);
      expect(URLValidator.validate('https://trinket.io/python/abc123')).toBe(true);
      expect(URLValidator.validate('https://p5js.org/reference')).toBe(true);
      expect(URLValidator.validate('https://openprocessing.org/sketch/123')).toBe(true);
      expect(URLValidator.validate('https://editor.p5js.org/user/sketches/abc')).toBe(true);
      expect(URLValidator.validate('https://codesandbox.io/s/abc123')).toBe(true);
    });

    it('rejects disallowed domains', () => {
      expect(URLValidator.validate('https://google.com')).toBe(false);
      expect(URLValidator.validate('https://facebook.com')).toBe(false);
      expect(URLValidator.validate('https://malicious-site.com')).toBe(false);
      expect(URLValidator.validate('https://example.com')).toBe(false);
    });

    it('rejects invalid URLs', () => {
      expect(URLValidator.validate('')).toBe(false);
      expect(URLValidator.validate('not-a-url')).toBe(false);
      expect(URLValidator.validate('ftp://itch.io')).toBe(false); // Not HTTPS
      expect(URLValidator.validate('http://itch.io')).toBe(false); // Not HTTPS
    });

    it('handles edge cases', () => {
      expect(URLValidator.validate('https://itch.io')).toBe(true); // Root domain
      expect(URLValidator.validate('https://itch.io/')).toBe(true); // With trailing slash
      expect(URLValidator.validate('https://itch.io/path?param=value')).toBe(true); // With query params
      expect(URLValidator.validate('https://itch.io/path#fragment')).toBe(true); // With fragment
    });
  });

  describe('normalize', () => {
    it('normalizes URLs correctly', () => {
      expect(URLValidator.normalize('HTTPS://ITCH.IO/GAME')).toBe('https://itch.io/game');
      expect(URLValidator.normalize('https://itch.io/game/')).toBe('https://itch.io/game');
      expect(URLValidator.normalize('https://itch.io/game?utm_source=test&utm_medium=test'))
        .toBe('https://itch.io/game');
      expect(URLValidator.normalize('https://itch.io/game#section')).toBe('https://itch.io/game');
    });

    it('preserves important query parameters', () => {
      expect(URLValidator.normalize('https://itch.io/game?embed=true'))
        .toBe('https://itch.io/game?embed=true');
      expect(URLValidator.normalize('https://scratch.mit.edu/projects/123?autostart=true'))
        .toBe('https://scratch.mit.edu/projects/123?autostart=true');
    });

    it('handles complex URLs', () => {
      const complexUrl = 'https://itch.io/game?embed=true&utm_source=test&autostart=false&utm_campaign=promo';
      expect(URLValidator.normalize(complexUrl))
        .toBe('https://itch.io/game?embed=true&autostart=false');
    });

    it('returns original URL for invalid inputs', () => {
      expect(URLValidator.normalize('not-a-url')).toBe('not-a-url');
      expect(URLValidator.normalize('')).toBe('');
    });
  });

  describe('isAllowedDomain', () => {
    it('correctly identifies allowed domains', () => {
      expect(URLValidator.isAllowedDomain(new URL('https://itch.io'))).toBe(true);
      expect(URLValidator.isAllowedDomain(new URL('https://user.github.io'))).toBe(true);
      expect(URLValidator.isAllowedDomain(new URL('https://codepen.io'))).toBe(true);
    });

    it('correctly identifies disallowed domains', () => {
      expect(URLValidator.isAllowedDomain(new URL('https://google.com'))).toBe(false);
      expect(URLValidator.isAllowedDomain(new URL('https://malicious.com'))).toBe(false);
    });

    it('handles subdomain matching', () => {
      expect(URLValidator.isAllowedDomain(new URL('https://my-game.itch.io'))).toBe(true);
      expect(URLValidator.isAllowedDomain(new URL('https://user.github.io'))).toBe(true);
      expect(URLValidator.isAllowedDomain(new URL('https://evil.google.com'))).toBe(false);
    });
  });

  describe('getDomainFromUrl', () => {
    it('extracts domains correctly', () => {
      expect(URLValidator.getDomainFromUrl('https://itch.io/game')).toBe('itch.io');
      expect(URLValidator.getDomainFromUrl('https://user.github.io/repo')).toBe('user.github.io');
      expect(URLValidator.getDomainFromUrl('https://codepen.io/pen/abc')).toBe('codepen.io');
    });

    it('handles invalid URLs', () => {
      expect(URLValidator.getDomainFromUrl('not-a-url')).toBe('');
      expect(URLValidator.getDomainFromUrl('')).toBe('');
    });
  });

  describe('getValidationError', () => {
    it('returns appropriate error messages', () => {
      expect(URLValidator.getValidationError(''))
        .toBe('Please enter a valid URL');
      
      expect(URLValidator.getValidationError('not-a-url'))
        .toBe('Please enter a valid URL starting with https://');
      
      expect(URLValidator.getValidationError('http://itch.io'))
        .toBe('URL must use HTTPS for security');
      
      expect(URLValidator.getValidationError('https://google.com'))
        .toBe('Domain google.com is not in the approved list of game hosting platforms');
      
      expect(URLValidator.getValidationError('https://itch.io/game'))
        .toBe('');
    });
  });

  describe('getAllowedDomains', () => {
    it('returns the list of allowed domains', () => {
      const domains = URLValidator.getAllowedDomains();
      expect(domains).toContain('itch.io');
      expect(domains).toContain('github.io');
      expect(domains).toContain('codepen.io');
      expect(domains.length).toBeGreaterThan(5);
    });

    it('returns a copy of the domains array', () => {
      const domains1 = URLValidator.getAllowedDomains();
      const domains2 = URLValidator.getAllowedDomains();
      expect(domains1).not.toBe(domains2); // Different array instances
      expect(domains1).toEqual(domains2); // Same content
    });
  });
});