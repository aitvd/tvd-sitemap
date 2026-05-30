# TVD SEO / AEO Plan

A living tracking doc for [thevillagedentist.com](https://thevillagedentist.com/), aligned
**strictly** to Google's
[AI features and your website](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
guide. AEO (AI Overviews / AI Mode visibility) is **not** a separate discipline: per the
guide, you earn it by being indexed, eligible for a snippet, and genuinely helpful.

This repo only *controls* the sitemap (Phase 0). Everything else is authored/tracked here but
**deployed in GHL, GSC, or Google Business Profile** — the owner column makes that explicit so
out-of-repo items don't get mistaken for "done."

_Last verified: 2026-05-30 (all states below are evidence-checked, not assumed)._

---

## The guide's guardrails (do / don't)

Split into three buckets so the plan never reads as "avoid helpful things":

### ✅ Helpful — do it
- Indexed & eligible to show with a snippet (**the one eligibility gate the guide names**)
- Unique, people-first content with a genuine point of view
- Semantic, crawlable HTML; main content separated from secondary
- Page experience: responsive, low latency, good Core Web Vitals
- Structured data (helpful, **not** a ranking gate)
- Google Business Profile + (for commerce) Merchant Center — the guide's named local/AI surfaces

### ⛔ Prohibited — penalty risk, never do
- Keyword-specific rewrites / doorway variations → **spam-policy violation**
- Inauthentic mentions, manufactured links/citations → **link-spam violation** (sitewide manual-action risk)
- Content variations made *solely* to manipulate AI ranking → spam trigger

### 〰️ Inert — does nothing, ignore
- `llms.txt` or AI-specific files (Google has stated it does not consume them)
- Content "chunking" into tiny pages (dilutes topical signal)

> The "it might help a little, so why not" instinct is itself the spam trigger the guide warns
> about. Effort belongs on the ✅ column, which compounds.

---

## Current state (evidence-based, 2026-05-30)

| Guide item | Status | Evidence |
|---|---|---|
| Indexable, no `noindex` | ✅ | Homepage has no noindex |
| Crawlers allowed (incl. Google-Extended) | ✅ | `robots.txt` = `Allow: /` |
| Titles + meta descriptions | ✅ | Strong, per-page optimized |
| Structured data | ✅ **already extensive** | Homepage carries 8 JSON-LD blocks: `Dentist`, `Physician`, `Organization`, `WebSite`, `FAQPage` (16 Q&A), `Service`/`Offer` (9), `MedicalProcedure` (8), `AggregateRating`, `OpeningHoursSpecification`, `GeoCoordinates`, `Neighborhood`/`City`/`Place` |
| Content in HTML, not JS-gated | ✅ | Main content server-rendered |
| Populated sitemap | ✅ | 55 URLs; live GitHub Pages = repo, byte-identical |
| Sitemap lists canonical 200 URLs | ✅ **fixed 2026-05-30** | Was 2× 301 (`/`→`/home`, `/services`→`/our_services`); now all 55 return 200 |
| robots.txt → populated sitemap | ❌ **open** | `robots.txt` references the empty native `/sitemap.xml` (0 bytes), not the populated one |
| Cross-domain sitemap verified in GSC | ❓ operator | Needs `aitvd.github.io` verified under the TVD GSC account |
| Schema validity (well-formed, no errors) | ❓ verify | Present & rich; confirm via Rich Results Test |
| Page experience / CWV / viewport | ❓ operator | Not yet measured |
| Google Business Profile optimized | ❓ operator | Guide's primary local/AI surface for a dental practice |

---

## Phased plan & owners

| # | Action | Owner | Status |
|---|---|---|---|
| 0 | Sitemap lists canonical 200 URLs | **this repo** | ✅ done 2026-05-30 |
| 0 | Point GHL `robots.txt` at the populated sitemap **or** confirm GSC direct submission is live | GHL + GSC | ⬜ |
| 0 | Verify `aitvd.github.io` in GSC (enables cross-domain sitemap) | GSC | ⬜ |
| 1 | Helpfulness / unique-POV audit of 6 pages + 49 posts | content (GHL) | ⬜ |
| 2 | Confirm canonicalization, duplicate reduction, redirects | GHL | ⬜ |
| 3 | Verify responsive viewport + Core Web Vitals | GHL | ⬜ |
| 4 | Validate existing JSON-LD (Rich Results Test); fix any errors | GHL | ⬜ |
| 4 | Optimize Google Business Profile | GBP | ⬜ |
| 5 | GSC baseline (coverage, impressions/clicks, CWV) + monthly review | operator | ⬜ |

---

## Operator checklist (out-of-repo — I can't push these)

1. **robots.txt** on thevillagedentist.com still advertises the empty native `/sitemap.xml`.
   Either repoint it to `https://aitvd.github.io/tvd-sitemap/sitemap.xml`, or confirm the
   populated sitemap is submitted directly in GSC (and that `aitvd.github.io` is verified).
2. **Run the Rich Results Test** on `/home`, `/our_services`, `/about-us` to confirm the
   already-present schema is valid (rich schema that's malformed is worse than none).
3. **Google Business Profile** — confirm hours, services, photos, reviews are current.
4. **Core Web Vitals** — check the GSC CWV report / PageSpeed Insights.

---

## Automation

| What | Status | Notes |
|---|---|---|
| Sitemap CI validation | ✅ in repo | `.github/workflows/validate-sitemap.yml` runs `scripts/validate-sitemap.sh` on every sitemap change + weekly. Validates XML, sweeps all `<loc>`s for `200` (Googlebot UA), and on schedule confirms live Pages == repo. Catches the redirect/404/drift bug class automatically. |
| Blog post auto-discovery | ✅ built & tested | `.github/workflows/discover-posts.yml` runs weekly: headless Chromium (`tools/discover-posts.mjs`) renders GHL's JS-paginated blog, clicks through "Next", and enumerates every post (verified: 51 across 9 pages, vs 6 in server HTML). `tools/reconcile-sitemap.mjs` adds genuinely-new, verified-200 posts and opens a **draft PR** for human review. Tested both ways: re-adds a removed live post; skips excluded posts. |
| Human-judgment gate | ✅ | `tools/excluded-posts.txt` lists deliberately-omitted posts (the 2 stale 2020 COVID posts). Discovery finds them live but never re-adds them — that's why it opens a PR instead of auto-committing. Stale entries (in sitemap, gone from blog) are *reported*, never auto-removed. |
| Retire the workaround | ⏳ watch | The weekly job can also alert if the native GHL `/sitemap.xml` ever stops being 0 bytes, signalling this repo is no longer needed. |

## How to update the sitemap

1. Edit `sitemap.xml` (list **canonical URLs that return 200** — no redirecting URLs).
2. Re-verify: every `<loc>` should return `200` under a Googlebot UA.
3. Commit + push; GitHub Pages republishes in ~1 min.
4. Request reindexing in GSC if needed.
