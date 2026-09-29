import { describe, it, expect } from 'vitest';
import { parseCompanyUrl, companyUrlSchema } from './url.js';

describe('parseCompanyUrl', () => {
  it('normalizes valid URLs with protocol and removes www', () => {
    const res1 = parseCompanyUrl('https://www.stripe.com');
    expect(res1.domain).toBe('stripe.com');
    expect(res1.url).toBe('https://www.stripe.com');

    const res2 = parseCompanyUrl('http://stripe.com');
    expect(res2.domain).toBe('stripe.com');
    expect(res2.url).toBe('http://stripe.com');
  });

  it('prepends https:// when protocol is missing', () => {
    const res = parseCompanyUrl('stripe.com/about');
    expect(res.domain).toBe('stripe.com');
    expect(res.url).toBe('https://stripe.com');
  });

  it('handles subdomains and lowercases', () => {
    const res = parseCompanyUrl('HTTPS://Careers.Acme.IO/jobs');
    expect(res.domain).toBe('careers.acme.io');
    expect(res.url).toBe('https://careers.acme.io');
  });

  it('rejects invalid domains without dots', () => {
    expect(() => parseCompanyUrl('localhost-not-valid')).toThrow('Invalid domain');
  });

  it('blocks private hosts and loopback addresses (SSRF defense)', () => {
    expect(() => parseCompanyUrl('http://localhost')).toThrow('Private/internal URLs are not allowed');
    expect(() => parseCompanyUrl('http://127.0.0.1')).toThrow('Private/internal URLs are not allowed');
    expect(() => parseCompanyUrl('http://169.254.169.254')).toThrow('Private/internal URLs are not allowed');
    expect(() => parseCompanyUrl('http://metadata.google.internal')).toThrow('Private/internal URLs are not allowed');
    expect(() => parseCompanyUrl('http://192.168.1.10')).toThrow('Private/internal URLs are not allowed');
    expect(() => parseCompanyUrl('http://10.0.0.5')).toThrow('Private/internal URLs are not allowed');
    expect(() => parseCompanyUrl('http://172.16.0.1')).toThrow('Private/internal URLs are not allowed');
  });

  it('validates and transforms via companyUrlSchema', () => {
    const parsed = companyUrlSchema.parse('github.com');
    expect(parsed.domain).toBe('github.com');
    expect(parsed.url).toBe('https://github.com');
  });
});
