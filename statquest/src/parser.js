// Reads a word problem and fills in the hypothesis-test form.
// Pattern-based (no AI service needed): it works best on textbook-style problems.

const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, ninety: 90, eighty: 80 };
const TEENS = { ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const UNITS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 };
const N = '(-?\\d*\\.?\\d+)';

function normalize(t) {
  return t
    .replace(/[\u0304\u0305\u0332\u00AF]/g, '')
    .replace(/[–—−]/g, '-')
    .replace(/(\d),(\d{3})(?!\d)/g, '$1$2')
    .replace(/\b(?:one|a)\s+hundred\b/gi, '100')
    .replace(/\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[-\s](one|two|three|four|five|six|seven|eight|nine))?\b/gi,
      (m, t, u) => String(TENS[t.toLowerCase()] + (u ? UNITS[u.toLowerCase()] : 0)))
    .replace(/\b(ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)\b/gi, (m) => String(TEENS[m.toLowerCase()]))
    .replace(/\s+/g, ' ')
    .trim();
}

function findAlpha(text) {
  let m = new RegExp(`${N}\\s*(%|percent)?\\s*(?:level of significance|significance level|level)`, 'i').exec(text);
  let v, start, end;
  if (m) { v = parseFloat(m[1]); if (m[2]) v /= 100; start = m.index; end = m.index + m[0].length; }
  if (!(v > 0 && v < 1)) {
    m = new RegExp(`(?:α|alpha|significance level|level of significance)\\s*(?:=|of|is|at)?\\s*${N}\\s*(%|percent)?`, 'i').exec(text);
    if (m) { v = parseFloat(m[1]); if (m[2]) v /= 100; start = m.index; end = m.index + m[0].length; }
  }
  if (!(v > 0 && v < 1)) {
    m = /(\d+(?:\.\d+)?)\s*(?:%|percent)\s*confidence/i.exec(text);
    if (m) { v = 1 - parseFloat(m[1]) / 100; start = m.index; end = m.index + m[0].length; }
  }
  return v > 0 && v < 1 ? { value: v, start, end } : null;
}

function readSeg(seg) {
  let s = ' ' + seg + ' ';
  const out = { text: seg };
  const grab = (re, fn) => {
    const m = re.exec(s);
    if (!m) return false;
    fn(m);
    s = s.slice(0, m.index) + ' '.repeat(m[0].length) + s.slice(m.index + m[0].length);
    return true;
  };
  grab(new RegExp(`(?:variance|(?<![a-z])[sσ]\\s*\\d?\\s*(?:\\^\\s*2|²)|sigma\\s*\\d?\\s*(?:\\^\\s*2|²))\\s*(?:of|is|was|=|equals?)?\\s*${N}`, 'i'),
    (m) => { out.spread = +m[1]; out.type = 'var'; });
  if (out.spread === undefined) {
    grab(new RegExp(`(?:standard deviation|std\\.? ?dev\\.?|stdev|(?<![a-z])(?:sd|σ|sigma|s))\\s*\\d?\\s*(?:of|is|was|=|equals?)\\s*${N}`, 'i'),
      (m) => {
        out.spread = +m[1]; out.type = 'sd';
        const before = s.slice(Math.max(0, m.index - 25), m.index).toLowerCase();
        out.kind = /sample/.test(before) || /^s\b/i.test(m[0].trim()) ? 'sample' : /population|known|σ|sigma/.test(before + m[0].toLowerCase()) ? 'pop' : undefined;
      });
  }
  grab(new RegExp(`(?<![a-z])(?:x|xbar|x-bar)\\s*\\d?\\s*(?:bar)?\\s*=\\s*${N}`, 'i'), (m) => { out.mean = +m[1]; });
  if (out.mean === undefined)
    grab(new RegExp(`(?:average|mean)(?:[^.\\d]{0,80}?(?:\\b(?:of|is|was|are|were|be|than|least|most|has|have|got|equals?)\\b|=))?\\s*${N}`, 'i'),
      (m) => { out.mean = +m[1]; });
  grab(new RegExp(`(?:μ|µ|mu)\\s*0?\\s*=\\s*${N}`, 'i'), (m) => { out.mu = +m[1]; });
  const nPats = [
    /(?<![a-z])n\s*\d?\s*=\s*(\d+)/i,
    /sample\s+size\s*(?:of|is|=)?\s*(\d+)/i,
    /sample\s+of\s+(\d+)/i,
    /(\d+)\s+(?:[a-z-]+\s+){0,3}?(?:were|was|are|is)\s+(?:randomly\s+)?(?:selected|sampled|tested|taken|surveyed|chosen|given|asked|measured|observed|recorded|interviewed)/i,
  ];
  for (const re of nPats) if (out.n === undefined && grab(re, (m) => { out.n = +m[1]; })) break;
  if (out.n === undefined && out.mean !== undefined) {
    const t = s.replace(/(?:group|sample|class|section|method|trial|brand|type)\s*\d/gi, '  ');
    const m = /(?<![\d.])(\d+)(?![\d%]|\.\d)/.exec(t);
    if (m && +m[1] >= 2) out.n = +m[1];
  }
  out.hasSample = /sample/i.test(seg);
  out.cue = /sample|showed|found|observed|recorded|taken|selected|tested|measured|survey|given|got|(?:has|have) an? (?:average|mean)/i.test(seg);
  return out;
}

const RIGHT_RE = /\b(?:higher|greater|larger|bigger|longer|better|faster|heavier|taller|more than|exceeds?|exceeded|above|increase[sd]?|improv\w+)\b/;
const LEFT_RE = /\b(?:lower|fewer|smaller|shorter|slower|lighter|worse|less than|below|decrease[sd]?|reduc\w+)\b/;
const HIGHER_WORDS = /^(?:higher|greater|larger|bigger|longer|better|faster|heavier|taller|more)$/;

function findTail(low) {
  let m;
  if ((m = /\b(?:left|lower)[- ]tail(?:ed)?\b/.exec(low))) return ['left', m[0]];
  if ((m = /\b(?:right|upper)[- ]tail(?:ed)?\b/.exec(low))) return ['right', m[0]];
  if ((m = /\btwo[- ]tail(?:ed)?\b|\btwo[- ]sided\b|\bboth tails\b/.exec(low))) return ['two', m[0]];
  if ((m = /\b(?:at least|no less than|not less than|minimum of)\b/.exec(low))) return ['left', m[0]];
  if ((m = /\b(?:at most|no more than|not more than|maximum of)\b/.exec(low))) return ['right', m[0]];
  if ((m = /\bsignificant difference\b|\bdifferent from\b|\bdiffers? from\b|\bis different\b|\bnot equal\b|\bnot the same\b|\bhas changed\b|\bhave changed\b|\bchanged\b|\bdifference (?:in|between)\b/.exec(low))) return ['two', m[0]];
  const r = RIGHT_RE.exec(low), l = LEFT_RE.exec(low);
  if (r && (!l || r.index < l.index)) return ['right', r[0]];
  if (l) return ['left', l[0]];
  return [null, null];
}

const LABEL_RE = /\b(method|group|class|section|brand|type|treatment|program|plan|school|product|machine|drug|variety|team|sample)\s+([a-z0-9])\b/gi;
function labelsIn(text) {
  const out = []; let m; const re = new RegExp(LABEL_RE.source, 'gi');
  while ((m = re.exec(text))) out.push({ key: `${m[1]} ${m[2]}`.toLowerCase(), pos: m.index });
  return out;
}

// Which sample is "higher"? Returns 'right' / 'left' (for μ₁ − μ₂) or null.
function twoSampleDirection(sentences, s1, s2) {
  const idx = (key) => (labelsIn(s1.text).some((l) => l.key === key) ? 0 : labelsIn(s2.text).some((l) => l.key === key) ? 1 : -1);
  for (const sent of sentences) {
    const m = /\b(higher|greater|larger|bigger|longer|better|faster|heavier|taller|more|lower|fewer|smaller|shorter|slower|lighter|worse|less)\b[^.?!]{0,80}?\bthan\b/i.exec(sent);
    if (!m) continue;
    const labs = labelsIn(sent);
    const thanPos = sent.toLowerCase().indexOf(' than', m.index);
    const subj = [...labs].reverse().find((l) => l.pos < m.index);
    const obj = labs.find((l) => l.pos > thanPos);
    if (!subj || !obj) continue;
    const si = idx(subj.key), oi = idx(obj.key);
    if (si < 0 || oi < 0 || si === oi) continue;
    const higher = HIGHER_WORDS.test(m[1].toLowerCase());
    return { tail: higher === (si === 0) ? 'right' : 'left', phrase: `${subj.key} ${m[1].toLowerCase()} than ${obj.key}` };
  }
  return null;
}

export function parseProblem(raw) {
  if (!raw || !/\d/.test(raw)) return { error: 'Paste the whole problem, including the numbers.' };
  const notes = [], found = [];
  const full = normalize(raw);
  const low = full.toLowerCase();

  // α
  let text = full, alpha = '0.05';
  const al = findAlpha(full);
  if (al) {
    text = full.slice(0, al.start) + ' '.repeat(al.end - al.start) + full.slice(al.end);
    const opts = [0.1, 0.05, 0.01];
    const near = opts.reduce((a, b) => (Math.abs(b - al.value) < Math.abs(a - al.value) ? b : a));
    alpha = near.toFixed(2);
    if (Math.abs(near - al.value) > 1e-9) notes.push(`α = ${al.value} is not one of the choices (0.10, 0.05, 0.01); I used ${alpha}. Change it if needed.`);
  } else notes.push('No significance level was found, so I used α = 0.05.');
  found.push(`α = ${alpha}`);

  // segments
  const sentences = text.split(/(?<=[.?!])\s+(?=[A-Z0-9])/).map((x) => x.trim()).filter(Boolean);
  const split = /(?=\b(?:while|whereas|but|however|another (?:random )?(?:sample|group)|a second (?:random )?(?:sample|group)|the second (?:random )?(?:sample|group)|the other (?:random )?sample)\b|\b(?:group|sample)\s*\d\s*[:\-])/i;
  const segs = sentences.flatMap((s) => s.split(split)).map((x) => x.trim()).filter(Boolean).map(readSeg);

  // one vs two sample
  const explicit2 = /\btwo[- ]sample\b|\btwo\s+(?:[a-z]+\s+)?(?:samples|groups|classes|sections|methods|treatments|programs|brands)\b|\b(?:group|sample)\s*1\b[^.]*\b(?:group|sample)\s*2\b|independent samples/i.test(full);
  const meanSegs = segs.filter((s) => s.mean !== undefined);
  let dataSegs = meanSegs.filter((s) => s.n !== undefined);
  let mode = dataSegs.length >= 2 ? 'two' : 'one';
  let s1, s2;
  if (mode === 'two') [s1, s2] = dataSegs;
  else if (explicit2 && meanSegs.length >= 2) {
    mode = 'two';
    const ns = segs.map((s) => s.n).filter((v) => v !== undefined);
    const sps = segs.filter((s) => s.spread !== undefined);
    s1 = { ...meanSegs[0], n: meanSegs[0].n ?? ns[0], spread: sps[0]?.spread, type: sps[0]?.type };
    s2 = { ...meanSegs[1], n: meanSegs[1].n ?? ns[1], spread: sps[1]?.spread, type: sps[1]?.type };
    notes.push('I matched the numbers to the two samples in the order they appear. Please check them.');
  }

  const fields = { alpha, mode, d0: '0', df: 'classic' };
  const str = (v) => (v === undefined || Number.isNaN(v) ? '' : String(v));

  if (mode === 'two') {
    let t1 = s1.type, t2 = s2.type, v1 = s1.spread, v2 = s2.spread;
    if (t1 && t2 && t1 !== t2) {
      if (t1 === 'var') v1 = Math.sqrt(v1); else v2 = Math.sqrt(v2);
      fields.spread = 'sd';
      notes.push('One sample gave a variance and the other a standard deviation, so I converted both to standard deviations.');
    } else fields.spread = (t1 || t2) === 'var' ? 'var' : 'sd';
    Object.assign(fields, { xbar1: str(s1.mean), sd1: str(v1), n1: str(s1.n), xbar2: str(s2.mean), sd2: str(v2), n2: str(s2.n) });
    found.push('Two-sample test', `Sample 1: x̄₁ = ${fields.xbar1}, n₁ = ${fields.n1}`, `Sample 2: x̄₂ = ${fields.xbar2}, n₂ = ${fields.n2}`);
  } else {
    const xSeg = meanSegs.find((s) => s.hasSample) || meanSegs.filter((s) => s.cue).pop() || (meanSegs.length > 1 ? meanSegs[meanSegs.length - 1] : meanSegs[0]);
    const mSeg = meanSegs.find((s) => s !== xSeg);
    const symMu = segs.find((s) => s.mu !== undefined)?.mu;
    let m0 = symMu ?? mSeg?.mean;
    if (m0 === undefined) {
      const m = new RegExp(`(?:higher than|greater than|more than|larger than|less than|lower than|fewer than|smaller than|above|below|exceeds?|different from|differs from|equal to|at least|at most|no more than|no less than)\\s+${N}`, 'i').exec(full);
      if (m) m0 = +m[1];
    }
    let xbar = xSeg?.mean;
    if (meanSegs.length === 1 && !xSeg.cue && m0 === undefined) { m0 = xSeg.mean; xbar = undefined; }
    const nSeg = (xSeg && xSeg.n !== undefined) ? xSeg : segs.find((s) => s.n !== undefined);
    const spSeg = (xSeg && xSeg.spread !== undefined) ? xSeg : segs.find((s) => s.spread !== undefined);
    Object.assign(fields, { m0: str(m0), xbar: str(xbar), sd: str(spSeg?.spread), n: str(nSeg?.n), spread: spSeg?.type === 'var' ? 'var' : 'sd' });
    found.push('One-sample test', `μ₀ = ${fields.m0}`, `x̄ = ${fields.xbar}`, `n = ${fields.n}`);
  }
  if (fields.spread === 'var') found.push('Variance values were given');

  // t or z
  const ns = mode === 'two' ? [s1.n, s2.n] : [fields.n === '' ? undefined : +fields.n];
  const minN = Math.min(...ns.filter((v) => v !== undefined));
  const kindHint = [...segs].find((s) => s.kind)?.kind;
  let dist, why;
  if (/\bt[- ]?test\b|student'?s t\b/.test(low)) { dist = 't'; why = 'the problem says t-test'; }
  else if (/\bz[- ]?test\b|\bz[- ]statistic\b/.test(low)) { dist = 'z'; why = 'the problem says Z-test'; }
  else if (Number.isFinite(minN)) { dist = minN < 30 ? 't' : 'z'; why = minN < 30 ? 'n < 30' : 'n ≥ 30'; }
  else { dist = kindHint === 'sample' ? 't' : 'z'; why = 'sample size not found'; }
  fields.dist = dist;
  found.unshift(`${dist === 'z' ? 'Z' : 't'}-test (${why})`);

  // tail
  let [tail, phrase] = findTail(low);
  if (mode === 'two' && (!tail || tail === 'right' || tail === 'left') && !/\b(?:left|right|lower|upper)[- ]tail/.test(low) && !/\bdifferent|difference/.test(low)) {
    const dir = twoSampleDirection(sentences, s1, s2);
    if (dir) { tail = dir.tail; phrase = dir.phrase; notes.push('Sample 1 is the first group in the problem and sample 2 is the second.'); }
    else if (tail) { notes.push('I could not tell which group is the "higher" one, so I assumed a two-tailed test. Choose the test type yourself if the problem is one-sided.'); tail = 'two'; phrase = null; }
  }
  if (!tail) { tail = 'two'; notes.push('No direction words (like "less than" or "higher than") were found, so I assumed a two-tailed test.'); }
  else if (/\bone[- ]tail(?:ed)?\b/.test(low) && !phrase) notes.push('The problem says one-tailed; please confirm left or right.');
  fields.tail = tail;
  found.push(`${{ two: 'Two', left: 'Left', right: 'Right' }[tail]}-tailed${phrase ? ` (from "${phrase}")` : ''}`);

  fields.claim = (sentences.find((s) => /claim|believe|test|is (?:higher|less|lower|greater)/i.test(s)) || sentences[0] || '').slice(0, 110);

  const need = mode === 'two' ? ['xbar1', 'sd1', 'n1', 'xbar2', 'sd2', 'n2'] : ['m0', 'xbar', 'sd', 'n'];
  const label = { m0: 'hypothesized mean (μ₀)', xbar: 'sample mean', sd: 'standard deviation / variance', n: 'sample size', xbar1: 'sample 1 mean', sd1: 'sample 1 spread', n1: 'sample 1 size', xbar2: 'sample 2 mean', sd2: 'sample 2 spread', n2: 'sample 2 size' };
  const missing = need.filter((k) => fields[k] === '' || fields[k] === undefined).map((k) => label[k]);
  return { fields, found, notes, missing };
}