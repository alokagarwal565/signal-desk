import { describe, it, expect } from 'vitest';
import { cleanText, classifyPage } from './scraper.js';

describe('cleanText', () => {
  it('collapses multiple whitespace and newlines', () => {
    const raw = '   Hello    World \n\n\n\n\n  from SignalDesk!   ';
    expect(cleanText(raw)).toBe('Hello World \n\n from SignalDesk!');
  });

  it('trims leading and trailing whitespace', () => {
    expect(cleanText('   test content   ')).toBe('test content');
  });
});

describe('classifyPage', () => {
  it('classifies root as homepage', () => {
    expect(classifyPage('https://example.com/')).toBe('homepage');
    expect(classifyPage('https://example.com')).toBe('homepage');
  });

  it('classifies about pages', () => {
    expect(classifyPage('https://example.com/about-us')).toBe('about');
  });

  it('classifies team pages', () => {
    expect(classifyPage('https://example.com/company/team')).toBe('team');
    expect(classifyPage('https://example.com/leadership')).toBe('team');
  });

  it('classifies careers/jobs pages', () => {
    expect(classifyPage('https://example.com/careers')).toBe('careers');
    expect(classifyPage('https://example.com/open-jobs')).toBe('careers');
  });

  it('classifies product pages', () => {
    expect(classifyPage('https://example.com/products/platform')).toBe('product');
    expect(classifyPage('https://example.com/solutions')).toBe('product');
  });

  it('classifies news and blog pages', () => {
    expect(classifyPage('https://example.com/blog/latest')).toBe('news');
    expect(classifyPage('https://example.com/press/releases')).toBe('news');
  });

  it('classifies contact pages', () => {
    expect(classifyPage('https://example.com/contact')).toBe('contact');
  });

  it('falls back to webpage for arbitrary paths', () => {
    expect(classifyPage('https://example.com/privacy-policy')).toBe('webpage');
  });
});
