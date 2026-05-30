// Enumerate every blog post on thevillagedentist.com by rendering the GHL SPA
// and clicking through the JS "Next" pagination. GHL's blog list is client-rendered
// from a private API, so a headless browser is the robust, maintainable approach.
// Output: JSON array of /post/<slug> pathnames to stdout.
import { chromium } from 'playwright';

const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const BLOG = 'https://thevillagedentist.com/blog';
const MAX_PAGES = 50; // safety stop

const collect = (page) =>
  page.$$eval('a[href*="/post/"]', as => [...new Set(as.map(a => new URL(a.href).pathname))]);

const browser = await chromium.launch();
const ctx = await browser.newContext({ userAgent: UA, ignoreHTTPSErrors: true });
const page = await ctx.newPage();
await page.goto(BLOG, { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(2000);

const all = new Set();
let pageNum = 0;
while (pageNum < MAX_PAGES) {
  pageNum++;
  (await collect(page)).forEach(u => all.add(u));

  const next = page.locator('a:has-text("Next"), button:has-text("Next")').first();
  const count = await next.count();
  if (!count) break;
  const disabled =
    (await next.getAttribute('disabled')) !== null ||
    (await next.getAttribute('aria-disabled')) === 'true' ||
    (await next.evaluate(el => el.classList.contains('disabled') ||
      getComputedStyle(el).pointerEvents === 'none').catch(() => false));
  if (disabled) break;

  const before = JSON.stringify(await collect(page));
  await next.click().catch(() => {});
  // wait until the rendered post set changes (new page loaded) or timeout
  await page.waitForFunction(
    (prev) => JSON.stringify([...new Set([...document.querySelectorAll('a[href*="/post/"]')]
      .map(a => new URL(a.href).pathname))]) !== prev,
    before,
    { timeout: 8000 }
  ).catch(() => {});
  await page.waitForTimeout(800);
  const after = JSON.stringify(await collect(page));
  if (after === before) break; // no change => reached the end
}

await browser.close();
const posts = [...all].sort();
console.error(`discovered ${posts.length} posts across ${pageNum} page(s)`);
process.stdout.write(JSON.stringify(posts, null, 2) + '\n');
