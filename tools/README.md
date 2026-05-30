# tools — blog discovery & sitemap reconciliation

Automates sitemap upkeep so posts don't have to be added by hand. GHL's blog is a
client-rendered SPA whose post list loads from a private API, so discovery uses a
headless browser rather than scraping server HTML (which only exposes ~6 of 50+ posts).

## Scripts

| File | What it does |
|---|---|
| `discover-posts.mjs` | Renders `/blog` in headless Chromium (Googlebot UA), clicks through "Next" pagination, prints a JSON array of every `/post/<slug>` to stdout. |
| `reconcile-sitemap.mjs` | Reads discovered posts + `excluded-posts.txt` + `../sitemap.xml`. **Adds** new, verified-200 posts; **reports** stale entries (never auto-removes). |
| `excluded-posts.txt` | Slugs a human chose not to index (one per line). Keeps deliberately-removed posts from being re-added. |

## Run locally

```bash
cd tools
npm ci
npx playwright install chromium
node discover-posts.mjs > /tmp/discovered.json
node reconcile-sitemap.mjs /tmp/discovered.json ../sitemap.xml
```

In CI this runs weekly via `.github/workflows/discover-posts.yml`, which opens a
**draft PR** for any new posts. Review the diff; to intentionally exclude a post,
add its slug to `excluded-posts.txt` instead of merging.
