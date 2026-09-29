import { z } from 'zod';

/** Validate and normalize a company URL. Returns the cleaned URL and extracted domain. */
export function parseCompanyUrl(raw: string): { url: string; domain: string } {
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  const parsed = new URL(url); // throws on invalid
  const domain = parsed.hostname.replace(/^www\./, '').toLowerCase();

  if (isPrivateHost(domain) || isPrivateIp(parsed.hostname)) {
    throw new Error('Private/internal URLs are not allowed');
  }
  if (!domain.includes('.')) throw new Error('Invalid domain');

  return { url: parsed.origin, domain };
}

// ponytail: SSRF protection — block private ranges. Upgrade path: use a proper allowlist/DNS resolution check.
const PRIVATE_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', 'metadata.google.internal'];

function isPrivateHost(host: string): boolean {
  return PRIVATE_HOSTS.includes(host);
}

function isPrivateIp(host: string): boolean {
  const parts = host.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return false;
  // 10.x.x.x, 172.16-31.x.x, 192.168.x.x
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1]! >= 16 && parts[1]! <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 127) return true;
  return false;
}

export const companyUrlSchema = z.string().min(1).max(2000).transform((val) => {
  const { url, domain } = parseCompanyUrl(val);
  return { url, domain };
});
