// Reconcile sitemap.xml against the live blog.
// Reads discovered posts (JSON array of /post/<slug> paths) and:
//   - ADDS genuinely-new posts (not already listed, not excluded) that return 200
//   - REPORTS stale entries (in sitemap but not found live) WITHOUT removing them
// Removal and inclusion of borderline posts are human judgment calls, so this
// script only ever *adds* verified-200 posts; a human reviews the PR.
//
// Usage: node reconcile-sitemap.mjs <discovered.json> [sitemap.xml]
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ORIGIN = 'https://thevillagedentist.com';
const UA = 'Googlebot/2.1 (+http://www.google.com/bot.html)';
const discPath = process.argv[2] || '/tmp/discovered.json';
const smPath = process.argv[3] || 'sitemap.xml';

const slug = (p) => p.replace(/^.*\/post\//, '').replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

const discovered = new Set(JSON.parse(readFileSync(discPath, 'utf8')).map(slug));
const excluded = new Set(
  readFileSync(new URL('./excluded-posts.txt', import.meta.url), 'utf8')
    .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
);
let xml = readFileSync(smPath, 'utf8');
const inSitemap = new Set([...xml.matchAll(/\/post\/([a-z0-9-]+)/g)].map(m => m[1]));

const newPosts = [...discovered].filter(s => !inSitemap.has(s) && !excluded.has(s)).sort();
const stale = [...inSitemap].filter(s => !discovered.has(s)).sort();
const excludedSeen = [...discovered].filter(s => excluded.has(s)).sort();

console.log(`discovered=${discovered.size} inSitemap=${inSitemap.size} excluded=${excluded.size}`);
if (excludedSeen.length) console.log(`skipped (excluded): ${excludedSeen.join(', ')}`);
if (stale.length) console.log(`STALE (in sitemap, not found live — review manually, not auto-removed):\n  ${stale.join('\n  ')}`);

const entry = (s) => {
  const u = `${ORIGIN}/post/${s}`;
  return `  <url>\n` +
    `    <loc>${u}</loc>\n` +
    `    <lastmod>${today}</lastmod>\n` +
    `    <changefreq>monthly</changefreq>\n` +
    `    <priority>0.8</priority>\n` +
    `    <xhtml:link rel="alternate" hreflang="en-CA" href="${u}" />\n` +
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${u}" />\n` +
    `  </url>\n`;
};

const added = [];
for (const s of newPosts) {
  let code = '000';
  try {
    code = execSync(`curl -s -o /dev/null -w "%{http_code}" -A "${UA}" --max-time 20 "${ORIGIN}/post/${s}"`,
      { encoding: 'utf8' }).trim();
  } catch { /* network error -> treat as non-200 */ }
  if (code === '200') added.push(s);
  else console.log(`  skip new post (HTTP ${code}, not canonical 200): ${s}`);
}

if (added.length) {
  xml = xml.replace(/\s*<\/urlset>\s*$/, '\n' + added.map(entry).join('') + '</urlset>\n');
  writeFileSync(smPath, xml);
  console.log(`ADDED ${added.length} new post(s):\n  ${added.join('\n  ')}`);
} else {
  console.log('No new posts to add — sitemap is in sync.');
}

// Emit a machine-readable result for CI (GitHub Actions reads this).
if (process.env.GITHUB_OUTPUT) {
  writeFileSync(process.env.GITHUB_OUTPUT,
    `changed=${added.length > 0}\nadded=${added.length}\nstale=${stale.length}\n`, { flag: 'a' });
}
