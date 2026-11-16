import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const dist = new URL('dist/', root);
const html = await readFile(new URL('index.html', dist), 'utf8');
const headers = await readFile(new URL('_headers', dist), 'utf8');
const canonical = 'https://maverosystems.netlify.app/';
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'A página deve ter um H1 principal.');
assert.match(html, /class="rise outline">Sites<\/span>/);
assert.ok(!/local-services|class="faq"|hero-location|footer-location|href="#duvidas"/.test(html), 'Preservar o conteúdo visual original.');
assert.ok(html.includes('Um bom design <b>chama atenção</b>. Um site inteligente <b>gera resultado</b>. Criamos plataformas rápidas e feitas sob medida para transformar visitantes em clientes.'));
assert.ok(html.includes('id="languageToggle" href="?lang=es"'));
assert.ok(html.indexOf('src="js/language.js?') < html.indexOf('src="js/page.js?'), 'O idioma deve ser aplicado antes das animações.');
assert.match(html, /<title>Criação de Sites em Campina Grande \| Mavero Systems<\/title>/);
assert.ok(html.includes(`rel="canonical" href="${canonical}"`));
const jsonld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert.ok(jsonld, 'Dados estruturados ausentes.');
const graph = JSON.parse(jsonld[1])['@graph'];
assert.equal(graph.find(item => item['@type'] === 'Organization').telephone, '+5583987770328');
assert.equal(graph.find(item => item['@type'] === 'Service').areaServed.name, 'Campina Grande');
assert.ok(!graph.some(item => item.aggregateRating || item.review), 'Não publicar avaliações inventadas.');

for (const [, attrs, content] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (!/\bsrc\s*=/.test(attrs) && content.trim()) {
    const hash = createHash('sha256').update(content).digest('base64');
    assert.ok(headers.includes(`'sha256-${hash}'`), 'A CSP deve acompanhar cada script inline.');
  }
}
assert.match(headers, /script-src 'self' 'sha256-/);
assert.match(headers, /script-src-attr 'none'/);
assert.match(headers, /object-src 'none'/);
assert.match(headers, /frame-ancestors 'none'/);
assert.ok(!headers.includes('unsafe-eval'));
assert.ok(!/script-src[^;\n]*(?:https:|\*)/.test(headers), 'Não liberar scripts de CDNs externas.');
assert.ok(!/<[^>]+\son[a-z]+\s*=/i.test(html), 'Não usar eventos inline.');
for (const [, src] of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
  assert.ok(!/^https?:/.test(src), 'Scripts devem ser servidos pelo próprio site.');
  await readFile(new URL(src.replace(/^\//, '').split('?')[0], dist));
}
const importmap = JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
for (const value of Object.values(importmap.imports)) {
  assert.ok(value.startsWith('/js/vendor/three-0.160.0/'));
}
const checksums = JSON.parse(await readFile(new URL('scripts/vendor-checksums.json', root), 'utf8'));
for (const [path, expected] of Object.entries(checksums)) {
  const actual = createHash('sha256').update(await readFile(new URL(path, dist))).digest('hex');
  assert.equal(actual, expected, `Dependência alterada: ${path}`);
}
for (const path of ['js/vendor/three-0.160.0/addons/loaders/GLTFLoader.js', 'js/vendor/three-0.160.0/addons/utils/BufferGeometryUtils.js', 'js/vendor/three-0.160.0/addons/environments/RoomEnvironment.js']) {
  const code = await readFile(new URL(path, dist), 'utf8');
  for (const [, specifier] of code.matchAll(/^\s*import\s+[^;]*?\sfrom\s+['"]([^'"]+)['"]/gm)) {
    if (specifier === 'three') continue;
    assert.ok(specifier.startsWith('./') || specifier.startsWith('../'));
    await readFile(new URL(specifier, new URL(path, dist)));
  }
}
const robots = await readFile(new URL('robots.txt', dist), 'utf8');
assert.ok(robots.includes(`Sitemap: ${canonical}sitemap.xml`));
assert.ok(!/Disallow:\s*\/\s*$/m.test(robots));
const sitemap = await readFile(new URL('sitemap.xml', dist), 'utf8');
assert.ok(sitemap.includes(`<loc>${canonical}</loc>`));
assert.ok(!sitemap.includes('deploy-preview'));
await readFile(new URL('404.html', dist));
for (const name of await readdir(dist)) {
  assert.ok(!['scripts', '.env', '.git', 'REVISAO.md', 'netlify.toml', 'node_modules'].includes(name), `Arquivo privado no deploy: ${name}`);
}
console.log('Verificações de SEO, CSP, dependências e arquivos publicados passaram.');
