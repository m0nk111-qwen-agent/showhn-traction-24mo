# Show HN traction, 24 months — every launch, Oct 2024 → Oct 2026

A dataset of **70,893 Show HN posts** (every "Show HN" story on Hacker News for the
24 months ending 2026-10-11), built with the free public HN Algolia API only — no
scraping, no key, no cost. Includes a time-to-first-comment sample of 1,493 stories
(two sampled weeks, one year apart).

Built and published by [Pennyforge](https://pennyforge.xyz) (2026-10-11).

## The short version

- **The median Show HN post gets 2 points.** p75 = 4, p90 = 9, p99 = 194, max = 3,346.
- **61.6% never get a single comment.**
- **≥10 points: 9.5%. ≥100 points: 2.2%.**
- **Submissions more than doubled over the 24 months (~2.4×)** (~1,600/month → ~3,900/month) —
  while the median stayed at 2 points (24 of 25 months; June 2026 hit 3) and the never-commented share stayed between
  0.55 and 0.68 for all 25 calendar months. The audience's attention did not double;
  the lottery just got more tickets.
- **github.com is 32.7% of all Show HN posts** (23,154 of 70,893).
- **Time-to-first-comment (for posts that ever get one): median ≈ 4.4 hours** — and
  this was nearly identical in sampled weeks one year apart (268 min in Oct 2025,
  264 min in Oct 2026). About 30% of commented posts get their first comment within
  an hour; the never-commented share was 0.658 (2025 week) vs 0.671 (2026 week) —
  both near the top of the monthly range. Early silence is the norm, not a signal.

## Files

| file | what it is |
|---|---|
| `showhn-24mo.csv` | 70,893 rows: id, created_at(_i), points, num_comments, author, domain, title, url |
| `showhn-24mo-summary.json` | distributions, per-month stability table, top domains/authors |
| `showhn-ttfc-sample.json` | per-story first-comment sample (2 weeks × ~500-1,000 stories) |
| `showhn-ttfc-summary.json` | TTFC medians/never-commented shares per window |
| `pull_24mo.js`, `analyze.js`, `ttfc_sample.js` | the whole pipeline (node, no deps) |

## Reproducing

```bash
node pull_24mo.js   # ~5 min, 360 free API calls (2-day time slices)
node analyze.js
node ttfc_sample.js # ~10 min (samples two weeks; edit WINDOWS to resample)
```

## Method notes & caveats

- Source: `hn.algolia.com/api/v1/search_by_date?tags=show_hn`. Algolia caps
  retrieval at 1000 hits per query (deeper pages silently return empty), so the
  pull slices time into 2-day windows — each well under the cap.
- Points have a floor of 1 (the self-vote), which is why "zero engagement" here
  means **zero comments**, not zero points.
- `num_comments`/`points` are snapshot values at pull time (2026-10-11); old posts
  can keep accruing both. TTFC windows are snapshots too.
- 2024-10 (518 posts) and 2026-10 (1,334 posts) are partial months.
- Verified: 5/5 randomly sampled rows matched the live API exactly (points + title)
  at publication time, and the pull is complete by construction — the sum of
  per-slice result counts reported by the API equals the 70,894 rows collected.
  (Trap: a single query spanning the whole window reports `nbHits` from the
  UNFILTERED all-time total while `hits`/`nbPages` reflect the date filter;
  per-slice counts are the ones that reconcile.)
- The sample windows for TTFC are the first ~week of October in 2025 and 2026 —
  chosen to be one year apart, not to be representative of launch seasonality.
  Sample sizes: 514 stories in the 2025 week (176 ever commented), 979 in the
  2026 week (322 ever commented).

## License

Data is public Hacker News content; use per HN's terms. Code: MIT.
