import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts';
import { hypTest, normPdf, tPdf, fmt, download } from './stats';
import { parseProblem } from './parser';

const INIT = {
  dist: 'z', mode: 'one', tail: 'two', alpha: '0.05', spread: 'sd', df: 'classic', claim: '',
  m0: '', xbar: '', sd: '', n: '',
  xbar1: '', sd1: '', n1: '', xbar2: '', sd2: '', n2: '', d0: '0',
};

// Examples taken from the Module 9 slides
const EXAMPLES = [
  { label: 'Z one-sample: luggage', f: { dist: 'z', mode: 'one', tail: 'two', m0: '40', xbar: '38', sd: '9.5', n: '50', claim: 'Average luggage weight is 40 kg' } },
  { label: 'Z one-sample: cereal boxes', f: { dist: 'z', mode: 'one', tail: 'two', m0: '500', xbar: '495', sd: '10', n: '36', claim: 'Mean cereal box weight is 500 g' } },
  { label: 'Z one-sample: school scores', f: { dist: 'z', mode: 'one', tail: 'right', m0: '75', xbar: '78', sd: '8', n: '100', claim: 'Average score is higher than 75' } },
  { label: 'Z two-sample: full-time vs working', f: { dist: 'z', mode: 'two', tail: 'two', spread: 'var', xbar1: '95', sd1: '10.5', n1: '50', xbar2: '88', sd2: '8.5', n2: '50', claim: 'Mean grades of the two groups differ' } },
  { label: 't one-sample: light bulbs', f: { dist: 't', mode: 'one', tail: 'left', m0: '725', xbar: '700', sd: '40', n: '20', claim: 'Bulb life span is less than 725 hours' } },
  { label: 't one-sample: coffee shop', f: { dist: 't', mode: 'one', tail: 'left', m0: '4', xbar: '3.6', sd: '0.8', n: '25', claim: 'Average waiting time is less than 4 minutes' } },
  { label: 't two-sample: public vs private', f: { dist: 't', mode: 'two', tail: 'two', spread: 'var', xbar1: '86', sd1: '48', n1: '10', xbar2: '88', sd2: '38', n2: '12', claim: 'Chemistry scores differ (α = 0.05 assumed)' } },
  { label: 't two-sample: teaching methods', f: { dist: 't', mode: 'two', tail: 'right', xbar1: '78', sd1: '7', n1: '35', xbar2: '75', sd2: '8', n2: '30', claim: 'Method B (sample 1) scores higher than Method A (sample 2)' } },
];

function hypotheses(f) {
  const sym = { two: ['=', '≠'], left: ['≥', '<'], right: ['≤', '>'] }[f.tail];
  const two = f.mode === 'two';
  const d0 = String(f.d0).trim() === '' ? '0' : f.d0;
  const L = two ? (Number(d0) === 0 ? 'μ₁' : 'μ₁ − μ₂') : 'μ';
  const R = two ? (Number(d0) === 0 ? 'μ₂' : d0) : (f.m0 === '' ? 'μ₀' : f.m0);
  return [`H₀: ${L} ${sym[0]} ${R}`, `H₁: ${L} ${sym[1]} ${R}`];
}

function solution(r, H0, H1) {
  const S = r.dist, sp = r.spreadName.replace('²', ''), v = r.v;
  const withD = r.mode === 'two' && v.d0 !== 0;
  const tailName = { two: 'Two-tailed', left: 'Left-tailed', right: 'Right-tailed' }[r.tail];
  const c = r.crit.map((x) => fmt(x)).join(' and ');
  const rule = r.tail === 'two' ? `Reject H₀ if ${S} < ${fmt(r.crit[0])} or ${S} > ${fmt(r.crit[1])}`
    : r.tail === 'left' ? `Reject H₀ if ${S} < ${c}` : `Reject H₀ if ${S} > ${c}`;
  const data = r.mode === 'one'
    ? `μ₀ = ${v.m0}, x̄ = ${v.xbar}, ${sp} = ${fmt(v.sd)}, n = ${v.n}`
    : `Sample 1: x̄₁ = ${v.xbar1}, ${sp}₁ = ${fmt(v.sd1)}, n₁ = ${v.n1}. Sample 2: x̄₂ = ${v.xbar2}, ${sp}₂ = ${fmt(v.sd2)}, n₂ = ${v.n2}.`;
  const calc = r.mode === 'one'
    ? `${S} = (x̄ − μ₀) / (${sp}/√n) = (${v.xbar} − ${v.m0}) / (${fmt(v.sd)}/√${v.n}) = ${fmt(r.stat)}`
    : `${S} = (x̄₁ − x̄₂${withD ? ' − D₀' : ''}) / √(${sp}₁²/n₁ + ${sp}₂²/n₂) = (${v.xbar1} − ${v.xbar2}${withD ? ` − ${v.d0}` : ''}) / √(${fmt(v.sd1 ** 2)}/${v.n1} + ${fmt(v.sd2 ** 2)}/${v.n2}) = ${fmt(r.stat)}`;
  const concl = r.reject
    ? `${S} = ${fmt(r.stat)} falls in the rejection region (p = ${fmt(r.p, 4)} ≤ α = ${r.alpha}). Reject H₀. There is sufficient evidence to support ${H1}.`
    : `${S} = ${fmt(r.stat)} falls in the acceptance (non-rejection) region (p = ${fmt(r.p, 4)} > α = ${r.alpha}). Fail to reject H₀. There is not enough evidence to support ${H1}; this does not prove H₀ is true.`;
  return [
    ['Step 1 · State the null hypothesis', H0],
    ['Step 2 · State the alternative hypothesis', H1],
    ['Step 3 · Set α', `α = ${r.alpha}  (confidence level = 1 − α = ${fmt((1 - r.alpha) * 100, 2)}%)`],
    ['Step 4 · Collect data', data],
    ['Step 5 · Calculate the test statistic', calc],
    ['Step 6 · Construct the rejection / acceptance regions', `${tailName} ${S}-test${r.df != null ? `, df = ${fmt(r.df, 2)}` : ''}. Critical value(s): ${c}. ${rule}; otherwise it falls in the acceptance (non-rejection) region.`],
    ['Step 7 · Draw a conclusion about H₀', concl],
  ];
}

function curveData(r) {
  const pdf = r.dist === 'z' ? normPdf : (x) => tPdf(x, r.df);
  const lo = Math.min(-4, r.stat - 0.5, ...r.crit.map((c) => c - 0.5));
  const hi = Math.max(4, r.stat + 0.5, ...r.crit.map((c) => c + 0.5));
  const e = 1e-9;
  const cl = r.tail !== 'right' ? r.crit[0] : null;
  const cr = r.tail !== 'left' ? r.crit[r.crit.length - 1] : null;
  const xs = [];
  const steps = Math.round((hi - lo) / 0.05);
  for (let i = 0; i <= steps; i++) xs.push(+(lo + i * 0.05).toFixed(4));
  [cl, cr].forEach((c) => c !== null && xs.push(c));
  xs.sort((a, b) => a - b);
  return {
    lo, hi, top: pdf(0) * 1.15,
    data: xs.map((x) => {
      const y = pdf(x);
      const L = cl !== null && x <= cl + e, R = cr !== null && x >= cr - e;
      const M = x >= (cl ?? -Infinity) - e && x <= (cr ?? Infinity) + e;
      return { x, left: L ? y : null, right: R ? y : null, mid: M ? y : null };
    }),
  };
}

export default function ZTest({ onSave }) {
  const [f, setF] = useState(INIT);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const [problem, setProblem] = useState('');
  const [info, setInfo] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const pick = (patch) => { setF({ ...f, ...patch }); setRes(null); setErr(''); };

  const two = f.mode === 'two', isZ = f.dist === 'z';
  const sp = (isZ ? 'σ' : 's') + (f.spread === 'var' ? '²' : '');
  const [H0, H1] = hypotheses(f);
  const lowN = isZ && (two ? [f.n1, f.n2] : [f.n]).some((n) => n !== '' && Number(n) < 30);

  const run = (form = f) => {
    const out = hypTest(form);
    if (out.error) { setErr(out.error); setRes(null); return; }
    setErr(''); setRes(out);
    onSave({
      module: 'ztest',
      title: `${out.dist === 'z' ? 'Z' : 't'}-test (${out.mode}-sample): ${out.dist} = ${fmt(out.stat, 3)}, p = ${fmt(out.p)}`,
      detail: `${out.reject ? 'Reject' : 'Fail to reject'} H₀ at α = ${out.alpha}`,
    });
  };
  const readProblem = () => {
    const p = parseProblem(problem);
    if (p.error) { setErr(p.error); setInfo(null); setRes(null); return; }
    const next = { ...INIT, ...p.fields };
    setF(next); setInfo(p); setRes(null);
    if (p.missing.length) { setErr(`I could not find: ${p.missing.join(', ')}. Please fill those in below, then press Solve.`); return; }
    setErr(''); run(next);
  };
  const loadExample = (e) => {
    const ex = EXAMPLES[e.target.value];
    if (ex) { setF({ ...INIT, alpha: '0.05', ...ex.f }); setRes(null); setErr(''); setInfo(null); }
    e.target.value = '';
  };

  const steps = res && solution(res, H0, H1);
  const summary = () => res && [
    `StatQuest — ${res.dist === 'z' ? 'Z' : 't'}-test (${res.mode}-sample)`,
    ...(f.claim ? [`Claim: ${f.claim}`] : []), '',
    ...steps.map(([t, b]) => `${t}\n  ${b}`), '', `p-value = ${fmt(res.p, 6)}`,
  ].join('\n');

  const chart = res && curveData(res);
  const S = res && res.dist;

  const field = (k, label, hint) => (
    <label>{label}{hint && <small className="hint">{hint}</small>}
      <input inputMode="decimal" value={f[k]} onChange={set(k)} />
    </label>
  );
  const toggle = (key, opts) => (
    <div className="row" role="group">
      {opts.map(([val, label]) => (
        <button key={val} className={'btn' + (f[key] === val ? '' : ' ghost')} aria-pressed={f[key] === val} onClick={() => pick({ [key]: val })}>{label}</button>
      ))}
    </div>
  );

  return (
    <>
      <h1 className="pix">🎯 Hypothesis Testing</h1>
      <div className="grid2">
        <section className="card">
          <h2>1. Set up the test</h2>
          <div className="paste">
            <label>✨ Paste the whole problem and I will read it for you
              <textarea rows="5" value={problem} onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g. A coffee shop claims the average waiting time is less than 4 minutes. A random sample of 25 orders has a mean of 3.6 minutes and a sample standard deviation of 0.8 minutes. Test at the 5% level of significance." />
            </label>
            <div className="row">
              <button className="btn" onClick={readProblem} disabled={!problem.trim()}>Read &amp; solve ▶</button>
              <button className="btn ghost" onClick={() => { setProblem(''); setInfo(null); }}>Clear</button>
            </div>
            {info && (
              <div className="found" role="status">
                <b>Here is what I understood:</b>
                <ul>{info.found.map((t) => <li key={t}>{t}</li>)}</ul>
                {info.notes.map((n) => <p key={n} className="note">ℹ️ {n}</p>)}
                <small>Anything wrong? Fix it in the boxes below and press Solve.</small>
              </div>
            )}
            <p className="or">— or enter everything manually —</p>
          </div>
          {toggle('dist', [['z', 'Z-test'], ['t', 't-test']])}
          {toggle('mode', [['one', 'One-sample'], ['two', 'Two-sample']])}
          <p className="note">
            {isZ ? 'Z-test: use when n ≥ 30 (σ known). ' : 't-test: use when σ is unknown or n < 30 (uses s and df). '}
            {two ? 'Assumes two independent samples from normal populations.' : 'Assumes a normal population or a large sample.'}
          </p>
          <label>Load a class example
            <select defaultValue="" onChange={loadExample}>
              <option value="" disabled>Choose a problem from the module…</option>
              {EXAMPLES.map((ex, i) => <option key={ex.label} value={i}>{ex.label}</option>)}
            </select>
          </label>
          <label>What are you testing? (optional)<input value={f.claim} onChange={set('claim')} placeholder="e.g. Average waiting time is less than 4 minutes" /></label>
          <label>Test type
            <select value={f.tail} onChange={set('tail')}>
              <option value="two">Two-tailed (≠)</option><option value="left">Left-tailed (&lt;)</option><option value="right">Right-tailed (&gt;)</option>
            </select>
          </label>
          <label>Level of significance (α)
            <select value={f.alpha} onChange={set('alpha')}><option>0.10</option><option>0.05</option><option>0.01</option></select>
          </label>
          <label>The problem gives me the…
            <select value={f.spread} onChange={set('spread')}>
              <option value="sd">Standard deviation ({isZ ? 'σ' : 's'})</option>
              <option value="var">Variance ({isZ ? 'σ²' : 's²'})</option>
            </select>
          </label>
          <p className="hyp"><b>{H0}</b><br /><b>{H1}</b></p>

          {!two ? (
            <>
              {field('m0', 'Hypothesized mean (μ₀)', 'The value in H₀')}
              {field('xbar', 'Sample mean (x̄)')}
              {field('sd', `${sp}`, isZ ? 'Population value, must be > 0' : 'Sample value, must be > 0')}
              {field('n', 'Sample size (n)')}
            </>
          ) : (
            <>
              <h3>Sample 1</h3>
              {field('xbar1', 'Mean (x̄₁)')}{field('sd1', `${sp}₁`)}{field('n1', 'Size (n₁)')}
              <h3>Sample 2</h3>
              {field('xbar2', 'Mean (x̄₂)')}{field('sd2', `${sp}₂`)}{field('n2', 'Size (n₂)')}
              {field('d0', 'Hypothesized difference (D₀)', 'Usually 0')}
              {!isZ && (
                <label>Degrees of freedom
                  <select value={f.df} onChange={set('df')}>
                    <option value="classic">n₁ + n₂ − 2 (standard table method)</option>
                    <option value="welch">Welch–Satterthwaite (unequal variances)</option>
                  </select>
                </label>
              )}
            </>
          )}
          {lowN && <p className="note">⚠️ Your module uses the Z-test only when n ≥ 30. With a smaller sample, consider the t-test.</p>}
          <div className="row">
            <button className="btn" onClick={() => run()}>Solve ▶</button>
            <button className="btn ghost" onClick={() => pick({ ...INIT, dist: f.dist, mode: f.mode })}>Reset</button>
          </div>
          {err && <p className="err" role="alert">⚠️ {err}</p>}
        </section>

        <section className="card">
          <h2>2. Solution (7 steps)</h2>
          {!res ? <p>Fill in the form (or load a class example) and press Solve.</p> : (
            <>
              <div className="stats">
                <div><small>{S}-statistic</small><b>{fmt(res.stat)}</b></div>
                <div><small>Critical value(s)</small><b>{res.crit.map((c) => fmt(c)).join(', ')}</b></div>
                <div><small>p-value</small><b>{fmt(res.p, 6)}</b></div>
                {res.df != null && <div><small>df</small><b>{fmt(res.df, 2)}</b></div>}
              </div>
              <p className={'verdict ' + (res.reject ? 'rej' : 'ftr')}>{res.reject ? 'Reject H₀' : 'Fail to reject H₀'}</p>
              <ol className="steps">
                {steps.map(([t, b]) => <li key={t}><b>{t}</b><br />{b}</li>)}
              </ol>
              <p className="note">Statistical significance is not the same as practical importance.</p>
              <button className="btn ghost" onClick={() => download('hypothesis-test.txt', summary())}>⬇ Download solution</button>
            </>
          )}
        </section>
      </div>

      {res && (
        <section className="card">
          <h2>3. {S === 'z' ? 'Normal' : 't'} curve</h2>
          <p><span className="sw" style={{ background: '#FF6B8A' }} /> Rejection region &nbsp; <span className="sw" style={{ background: '#C9B6FF' }} /> Acceptance (non-rejection) region</p>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chart.data} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <XAxis type="number" dataKey="x" domain={[chart.lo, chart.hi]} allowDataOverflow tickFormatter={(x) => fmt(x, 1)} />
              <YAxis hide domain={[0, chart.top]} />
              <Tooltip formatter={(v) => fmt(v, 4)} labelFormatter={(x) => `${S} = ${fmt(x, 2)}`} />
              <Area dataKey="mid" stroke="#7C4DFF" fill="#C9B6FF" fillOpacity={0.8} isAnimationActive={false} name="Acceptance" />
              <Area dataKey="left" stroke="#E0446A" fill="#FF6B8A" fillOpacity={0.9} isAnimationActive={false} name="Rejection" />
              <Area dataKey="right" stroke="#E0446A" fill="#FF6B8A" fillOpacity={0.9} isAnimationActive={false} name="Rejection" />
              {res.crit.map((c) => <ReferenceLine key={c} x={c} stroke="#1B1B3A" strokeDasharray="4 3" label={{ value: `crit ${fmt(c, 3)}`, position: 'top', fontSize: 11 }} />)}
              <ReferenceLine x={res.stat} stroke="#00A870" strokeWidth={3} label={{ value: `${S} = ${fmt(res.stat, 3)}`, position: 'insideTopRight', fill: '#00A870', fontSize: 12 }} />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      )}
    </>
  );
}