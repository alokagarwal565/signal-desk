import * as cheerio from 'cheerio';
import { logger } from '../../utils/logger.js';
import { config } from '../../config/index.js';

export interface ScrapedPage {
  url: string;
  title: string;
  content: string;
  sourceType: string;
  success: boolean;
  error?: string;
}

// ponytail: Simple fetch + cheerio scraper. Upgrade path: headless browser (playwright) for JS-rendered pages.
export async function scrapePage(url: string): Promise<ScrapedPage> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SignalDesk Research Bot/1.0 (https://signaldesk.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(config.research.timeoutMs),
      redirect: 'follow',
    });

    if (!res.ok) {
      return { url, title: '', content: '', sourceType: 'webpage', success: false, error: `HTTP ${res.status}` };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract JSON-LD structured data (founders, organization info) before removing scripts
    const jsonLdData: string[] = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const text = $(el).html();
        if (text && text.trim()) {
          const json = JSON.parse(text);
          jsonLdData.push(JSON.stringify(json));
        }
      } catch {}
    });

    // Remove noise
    $('script, style, nav, footer, header, iframe, noscript, svg').remove();

    const title = $('title').first().text().trim() || $('h1').first().text().trim() || '';
    let content = extractReadableContent($);
    if (jsonLdData.length > 0) {
      content += '\n\nStructured Organization & People Metadata:\n' + jsonLdData.join('\n');
    }

    return { url, title, content: content.slice(0, 50000), sourceType: classifyPage(url), success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.warn('Scrape failed', { url, error: msg });
    return { url, title: '', content: '', sourceType: 'webpage', success: false, error: msg };
  }
}

function extractReadableContent($: cheerio.CheerioAPI): string {
  // Prefer main content areas
  const selectors = ['main', 'article', '[role="main"]', '.content', '#content', '.post-content', '.entry-content'];
  for (const sel of selectors) {
    const el = $(sel);
    if (el.length && el.text().trim().length > 100) {
      return cleanText(el.text());
    }
  }
  // Fall back to body
  return cleanText($('body').text());
}

export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

export function classifyPage(url: string): string {
  const path = new URL(url).pathname.toLowerCase();
  if (path.includes('about')) return 'about';
  if (path.includes('team') || path.includes('leadership') || path.includes('people')) return 'team';
  if (path.includes('career') || path.includes('job') || path.includes('hiring')) return 'careers';
  if (path.includes('product') || path.includes('solution') || path.includes('service')) return 'product';
  if (path.includes('blog') || path.includes('news') || path.includes('press') || path.includes('announcement')) return 'news';
  if (path.includes('contact')) return 'contact';
  if (path === '/' || path === '') return 'homepage';
  return 'webpage';
}

/** Discover important pages on a company website. */
export async function discoverPages(baseUrl: string): Promise<string[]> {
  const pages: string[] = [baseUrl];

  try {
    const res = await fetch(baseUrl, {
      headers: { 'User-Agent': 'SignalDesk Research Bot/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return pages;

    const html = await res.text();
    const $ = cheerio.load(html);
    const base = new URL(baseUrl);

    // Prioritize high-value organizational & leadership pages
    const candidateKeyPaths = ['/about-us', '/about', '/team', '/leadership', '/company', '/careers'];
    for (const p of candidateKeyPaths) {
      if (pages.length >= config.research.maxPagesPerSite) break;
      try {
        const candidateUrl = new URL(p, baseUrl).href;
        if (!pages.includes(candidateUrl)) {
          const check = await fetch(candidateUrl, {
            method: 'HEAD',
            redirect: 'follow',
            signal: AbortSignal.timeout(3000),
          });
          if (check.ok && !pages.includes(check.url)) {
            pages.push(check.url);
          }
        }
      } catch {}
    }

    const importantPaths = ['about', 'team', 'careers', 'jobs', 'products', 'solutions', 'services', 'blog', 'news', 'press', 'company', 'leadership', 'contact', 'pricing'];

    $('a[href]').each((_, el) => {
      if (pages.length >= config.research.maxPagesPerSite) return false;
      try {
        const href = $(el).attr('href');
        if (!href) return;
        const resolved = new URL(href, baseUrl);
        if (resolved.hostname !== base.hostname) return;

        const pathLower = resolved.pathname.toLowerCase();
        const isImportant = importantPaths.some((p) => pathLower.includes(p));
        if (isImportant && !pages.includes(resolved.href)) {
          pages.push(resolved.href);
        }
      } catch {
        // Skip invalid URLs
      }
    });
  } catch (error) {
    logger.warn('Page discovery failed', { baseUrl, error: String(error) });
  }

  return pages;
}
