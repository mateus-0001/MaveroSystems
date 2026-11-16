import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

// Publica apenas os recursos do site, sem arquivos de revisão, ferramentas ou configuração.
const publicFiles = ['index.html', '404.html', 'robots.txt', 'sitemap.xml', 'css', 'js', 'assets'];
for (const file of publicFiles) {
  await cp(new URL(file, root), new URL(file, output), { recursive: true });
}

const html = await readFile(new URL('index.html', root), 'utf8');
const inlineHashes = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(([, attrs, content]) => !/\bsrc\s*=/i.test(attrs) && content.trim())
  .map(([, , content]) => `'sha256-${createHash('sha256').update(content).digest('base64')}'`);
const policy = [
  "default-src 'self'",
  `script-src 'self' ${inlineHashes.join(' ')}`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "frame-src https://app.netlify.com",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'",
  'upgrade-insecure-requests'
].join('; ');
let headers = await readFile(new URL('_headers', root), 'utf8');
headers = headers.replace('/*\n', `/*\n  Content-Security-Policy: ${policy}\n`);
if (process.env.CONTEXT && process.env.CONTEXT !== 'production') {
  headers = headers.replace('/*\n', "/*\n  X-Robots-Tag: noindex, nofollow\n");
}
await writeFile(new URL('_headers', output), headers);
console.log(`Site preparado em dist/ com CSP e ${inlineHashes.length} hashes de scripts.`);
