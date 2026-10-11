#!/usr/bin/env node
/* TTFC (time-to-first-comment) on two sampled windows, one year apart.
 * Per story: first comment via tags=comment,story_<id> sorted by created_at, hitsPerPage=1. */
'use strict';
const fs = require('fs');
const path = require('path');
const CSV = fs.readFileSync(path.join(__dirname, 'data', 'showhn-24mo.csv'), 'utf8').trim().split('\n').slice(1);
const rows = CSV.map((l) => { const m = l.match(/^(\d+),([^,]*),(\d+),/); return m ? { id: m[1], t: +m[3] } : null; }).filter(Boolean);
const WINDOWS = [
  { label: '2025-10-week1', lo: 1759276800, hi: 1759881600 }, // 2025-10-01..08 UTC
  { label: '2026-10-week1', lo: 1790812800, hi: 1791417600 }, // 2026-10-01..08 UTC
];
(async () => {
  const out = [];
  for (const w of WINDOWS) {
    const sel = rows.filter((r) => r.t >= w.lo && r.t < w.hi);
    console.log(w.label, 'stories:', sel.length);
    let done = 0;
    for (const r of sel) {
      try {
        const res = await fetch(`https://hn.algolia.com/api/v1/search?tags=comment,story_${r.id}&hitsPerPage=1`, { headers: { 'User-Agent': 'pennyforge-research/0.1' } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const d = await res.json();
        const h = (d.hits || [])[0];
        out.push({ story: r.id, window: w.label, first_comment_at: h ? h.created_at_i : null, ttfc_s: h ? h.created_at_i - r.t : null });
      } catch (e) { out.push({ story: r.id, window: w.label, error: String(e.message || e).slice(0, 60) }); }
      done++;
      if (done % 250 === 0) console.log(w.label, done + '/' + sel.length);
      await new Promise((r2) => setTimeout(r2, 300));
    }
  }
  fs.writeFileSync(path.join(__dirname, 'data', 'showhn-ttfc-sample.json'), JSON.stringify(out));
  console.log('done', out.length);
})().catch((e) => { console.error('FATAL', String(e).slice(0, 150)); process.exit(3); });
