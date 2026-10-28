export const fmt = (v, d = 4) =>
  Number.isFinite(v) ? String(Number(v.toFixed(d))) : 'undefined';

/* ---------- Normal distribution ---------- */
export const normPdf = (x) => Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI);

export function normCdf(x) {
  if (x < -8) return 0;
  if (x > 8) return 1;
  let s = x, t = x;
  for (let i = 1; i < 300; i++) {
    t *= (x * x) / (2 * i + 1);
    s += t;
    if (Math.abs(t) < 1e-17) break;
  }
  return 0.5 + s * normPdf(x);
}

/* ---------- Student t distribution ---------- */
function lgamma(x) {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.001208650973866179, -0.000005395239384953];
  let y = x, t = x + 5.5;
  t -= (x + 0.5) * Math.log(t);
  let s = 1.000000000190015;
  for (let j = 0; j < 6; j++) s += c[j] / ++y;
  return -t + Math.log((2.5066282746310005 * s) / x);
}

function betacf(a, b, x) {
  const FP = 1e-300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FP) d = FP;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FP) d = FP;
    c = 1 + aa / c; if (Math.abs(c) < FP) c = FP;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FP) d = FP;
    c = 1 + aa / c; if (Math.abs(c) < FP) c = FP;
    d = 1 / d;
    const del = d * c; h *= del;
    if (Math.abs(del - 1) < 3e-16) break;
  }
  return h;
}

function betaInc(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b;
}

export const tPdf = (x, v) =>
  (Math.exp(lgamma((v + 1) / 2) - lgamma(v / 2)) / Math.sqrt(v * Math.PI)) * Math.pow(1 + (x * x) / v, -(v + 1) / 2);

export function tCdf(t, v) {
  const ib = betaInc(v / (v + t * t), v / 2, 0.5);
  return t > 0 ? 1 - 0.5 * ib : 0.5 * ib;
}

function invert(cdf, p, lo, hi) {
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    cdf(mid) < p ? (lo = mid) : (hi = mid);
  }
  return (lo + hi) / 2;
}
export const normInv = (p) => invert(normCdf, p, -10, 10);
export const tInv = (p, v) => invert((x) => tCdf(x, v), p, -1e5, 1e5);

/* ---------- Regression ---------- */
export function parseText(text) {
  return text.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const p = l.split(/[\s,;]+/);
    return { x: p[0] ?? '', y: p[1] ?? '' };
  });
}

export function parsePairs(rows) {
  const pts = [];
  for (let i = 0; i < rows.length; i++) {
    const x = String(rows[i].x).trim(), y = String(rows[i].y).trim();
    if (!x && !y) continue;
    if (!x || !y) return { error: `Row ${i + 1} is missing a value.` };
    if (!Number.isFinite(Number(x)) || !Number.isFinite(Number(y)))
      return { error: `Row ${i + 1} must contain numbers only.` };
    pts.push({ x: +x, y: +y });
  }
  return { pts };
}

export function regression(pts) {
  const n = pts.length;
  if (n < 3) return { error: 'Enter at least 3 valid (X, Y) pairs.' };
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  let Sxx = 0, Sxy = 0, Syy = 0;
  for (const p of pts) {
    Sxx += (p.x - mx) ** 2;
    Sxy += (p.x - mx) * (p.y - my);
    Syy += (p.y - my) ** 2;
  }
  if (Sxx === 0) return { error: 'All X values are identical, so a slope cannot be computed.' };
  const b = Sxy / Sxx, a = my - b * mx;
  const sse = pts.reduce((s, p) => s + (p.y - (a + b * p.x)) ** 2, 0);
  const r = Syy === 0 ? NaN : Sxy / Math.sqrt(Sxx * Syy);
  const r2 = Syy === 0 ? NaN : 1 - sse / Syy;
  return { n, mx, my, a, b, r, r2 };
}

export function strength(r) {
  if (!Number.isFinite(r)) return { label: 'undefined (Y has no variation)', dir: '' };
  const m = Math.abs(r);
  const label = m < 0.2 ? 'very weak' : m < 0.4 ? 'weak' : m < 0.6 ? 'moderate' : m < 0.8 ? 'strong' : 'very strong';
  return { label, dir: r > 0 ? 'positive' : r < 0 ? 'negative' : 'no linear' };
}

/* ---------- Hypothesis tests: Z or t, one- or two-sample ---------- */
const isNum = (v) => String(v ?? '').trim() !== '' && Number.isFinite(Number(v));

export function hypTest(f) {
  const dist = f.dist === 't' ? 't' : 'z';
  const two = f.mode === 'two';
  const al = +f.alpha, tail = f.tail;
  const need = two ? ['xbar1', 'sd1', 'n1', 'xbar2', 'sd2', 'n2'] : ['m0', 'xbar', 'sd', 'n'];
  if (need.some((k) => !isNum(f[k]))) return { error: 'Please fill in every field with a valid number.' };
  if (two && String(f.d0 ?? '').trim() !== '' && !isNum(f.d0)) return { error: 'Hypothesized difference D₀ must be a number.' };

  const sdOf = (v) => (f.spread === 'var' ? Math.sqrt(+v) : +v);
  const name = dist === 'z' ? (f.spread === 'var' ? 'σ²' : 'σ') : (f.spread === 'var' ? 's²' : 's');
  const minN = dist === 't' ? 2 : 1;
  const v = {};
  let se, stat, df = null;

  if (two) {
    Object.assign(v, { xbar1: +f.xbar1, xbar2: +f.xbar2, sd1: sdOf(f.sd1), sd2: sdOf(f.sd2), n1: +f.n1, n2: +f.n2, d0: isNum(f.d0) ? +f.d0 : 0 });
    if (!(v.sd1 > 0) || !(v.sd2 > 0)) return { error: `Both ${name} values must be greater than 0.` };
    if (![v.n1, v.n2].every((k) => Number.isInteger(k) && k >= minN)) return { error: `Both sample sizes must be whole numbers ≥ ${minN}.` };
    const a = (v.sd1 * v.sd1) / v.n1, b = (v.sd2 * v.sd2) / v.n2;
    se = Math.sqrt(a + b);
    stat = (v.xbar1 - v.xbar2 - v.d0) / se;
    if (dist === 't') df = f.df === 'welch' ? (a + b) ** 2 / ((a * a) / (v.n1 - 1) + (b * b) / (v.n2 - 1)) : v.n1 + v.n2 - 2;
  } else {
    Object.assign(v, { m0: +f.m0, xbar: +f.xbar, sd: sdOf(f.sd), n: +f.n });
    if (!(v.sd > 0)) return { error: `${name} must be greater than 0.` };
    if (!Number.isInteger(v.n) || v.n < minN) return { error: `Sample size n must be a whole number ≥ ${minN}.` };
    se = v.sd / Math.sqrt(v.n);
    stat = (v.xbar - v.m0) / se;
    if (dist === 't') df = v.n - 1;
  }

  const cdf = dist === 'z' ? normCdf : (x) => tCdf(x, df);
  const inv = dist === 'z' ? normInv : (p) => tInv(p, df);
  let crit, p;
  if (tail === 'left') { crit = [-inv(1 - al)]; p = cdf(stat); }
  else if (tail === 'right') { crit = [inv(1 - al)]; p = 1 - cdf(stat); }
  else { const c = inv(1 - al / 2); crit = [-c, c]; p = 2 * (1 - cdf(Math.abs(stat))); }
  return { dist, mode: two ? 'two' : 'one', stat, df, se, crit, p, reject: p <= al, tail, alpha: al, v, spreadName: name };
}

export function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}