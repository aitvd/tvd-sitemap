# tvd-sitemap

Static `sitemap.xml` for [thevillagedentist.com](https://thevillagedentist.com/), hosted via GitHub Pages.

## Why this exists

The native GHL-served sitemap at `https://thevillagedentist.com/sitemap.xml` returns 200 with 0 bytes -- it's empty because GHL's per-asset `Show in Sitemap` toggles are gated behind a cross-origin page-builder iframe that no public API can reach. This repo is the workaround: a static, hand-curated sitemap submitted to Google Search Console directly, bypassing the empty native sitemap.

## URLs

- Live sitemap: `https://aitvd.github.io/tvd-sitemap/sitemap.xml`
- 29 entries: homepage + 5 site pages + 23 blog posts (2 stale COVID-2020 posts excluded)

## How to update

1. Edit `sitemap.xml`
2. Commit + push to `main`
3. GitHub Pages republishes within ~1 minute
4. Google will recrawl on its own schedule, or you can request reindexing in GSC

## GSC submission

In Google Search Console for `https://thevillagedentist.com/` property:

1. `Sitemaps` left nav
2. Enter `https://aitvd.github.io/tvd-sitemap/sitemap.xml`
3. Submit

Cross-domain sitemaps are allowed when (a) `aitvd.github.io` is also verified in GSC under the same Google account, OR (b) the sitemap URL is referenced from `robots.txt` on the URLs' domain. For TVD, both paths are open -- the operator can verify `aitvd.github.io` with one click via the Google account that owns the TVD GSC property.