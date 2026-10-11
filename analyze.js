#!/usr/bin/env node
/* C-NEW-83: distribution analysis over the 24-month Show HN pull. */
'use strict';
const fs = require('fs');
const path = require('path');
const lines = fs.readFileSync(path.join(__dirname, 'data', 'showhn-24mo.csv'), 'utf8').trim().split('\n');
const rows = lines.slice(1).map((l) => {
  // CSV has quoted fields; parse minimally (title/url quoted, may contain commas)
  const m = l.match(/^(\d+),([^,]*),(\d+),(\d+),(\d+),"([^"]*)","([^"]*)","((?:[^"]|"")*)","((?:[^"]|"")*)"$/);
  if (!m) return null;
  return { id: m[1], created_at: m[2], created_at_i: +m[3], points: +m[4], num_comments: +m[5], author: m[6], domain: m[7], title: m[8].replace(/""/g, '"'), url: m[9].replace(/""/g, '"') };
}).filter(Boolean);
console.log('parsed rows:', rows.length, 'of', lines.length - 1);
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))] ?? 0; };
const pts = rows.map((r) => r.points), cmts = rows.map((r) => r.num_comments);
const out = { total: rows.length, parsed: rows.length };
out.points = { median: pct(pts, 0.5), p75: pct(pts, 0.75), p90: pct(pts, 0.9), p99: pct(pts, 0.99), max: Math.max(...pts), ge1: pts.filter((x) => x >= 1).length, ge10: pts.filter((x) => x >= 10).length, ge100: pts.filter((x) => x >= 100).length };
out.comments = { median: pct(cmts, 0.5), p90: pct(cmts, 0.9), max: Math.max(...cmts), zero: cmts.filter((x) => x === 0).length };
out.zero_engagement = rows.filter((r) => r.points === 0 && r.num_comments === 0).length;
// by month: stability of the lottery
const byMonth = {};
for (const r of rows) {
  const k = r.created_at.slice(0, 7);
  (byMonth[k] = byMonth[k] || { n: 0, zero: 0, ge10: 0, pts: [] });
  byMonth[k].n++; byMonth[k].pts.push(r.points);
  if (r.num_comments === 0) byMonth[k].zero++;
  if (r.points >= 10) byMonth[k].ge10++;
}
out.by_month = Object.entries(byMonth).sort().map(([k, v]) => ({ month: k, n: v.n, zero_share: +(v.zero / v.n).toFixed(3), ge10: v.ge10, median_pts: pct(v.pts, 0.5) }));
// domains
const dom = {};
for (const r of rows) { if (r.domain) dom[r.domain] = (dom[r.domain] || 0) + 1; else out.no_url = (out.no_url || 0) + 1; }
out.top_domains = Object.entries(dom).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([d, n]) => ({ domain: d, n }));
out.domains_total = Object.keys(dom).length;
// authors
const au = {};
for (const r of rows) au[r.author] = (au[r.author] || 0) + 1;
out.top_authors = Object.entries(au).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([d, n]) => ({ author: d, n }));
fs.writeFileSync(path.join(__dirname, 'data', 'showhn-24mo-summary.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ total: out.total, points: out.points, comments: out.comments, zero_engagement: out.zero_engagement, no_url: out.no_url, months: out.by_month.length, top_domains: out.top_domains.slice(0, 6) }, null, 1));
