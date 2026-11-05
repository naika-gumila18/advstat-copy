import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts';
import { hypTest, normPdf, tPdf, fmt, download } from './stats';
import { parseProblem } from './parser';
import Formula from './Formula';

const INIT = {
  dist: 'z', mode: 'one', tail: 'two', alpha: '0.05', spread: 'sd', df: 'classic', claim: '',
  m0: '', xbar: '', sd: '', n: '',
  xbar1: '', sd1: '', n1: '', xbar2: '', sd2: '', n2: '', d0: '0',
};

// Examples taken from the Module 9 slides with actual given word problems
const EXAMPLES = [
  {
    label: 'Sample 1 · Luggage weight (Z one-sample)',
    slide: 'Sample 1 ',
    problemText: 'A traveler claims that the average weight of his luggage is 40 kilos with a standard deviation of 9.5 kilos. Would you agree to this claim if a random sample of 50 luggage showed an average weight of 38 kilos using 0.05 level of significance.',
    f: { dist: 'z', mode: 'one', tail: 'two', m0: '40', xbar: '38', sd: '9.5', n: '50', claim: 'Average luggage weight is 40 kg' },
  },
  {
    label: 'Sample 2 · Cereal boxes (Z one-sample)',
    slide: 'Sample 2',
    problemText: "A manufacturer claims that the mean weight of their cereal boxes is 500 grams. To test this claim, a random sample of 36 cereal boxes is selected, and their weights are recorded. The sample mean weight is found to be 495 grams with a known population standard deviation of 10 grams. At a 5% level of significance, can you conclude that the mean weight of the cereal boxes is different from the manufacturer's claim?",
    f: { dist: 'z', mode: 'one', tail: 'two', m0: '500', xbar: '495', sd: '10', n: '36', claim: 'Mean cereal box weight is 500 g' },
  },
  {
    label: 'Sample 3 · School scores (Z one-sample)',
    slide: 'Sample 3',
    problemText: "A school district claims that the average score of its students in a standardized test is higher than 75. To test this claim, a random sample of 100 students is taken, and their average score is found to be 78 with a known population standard deviation of 8. Conduct a one-tailed z-test at a 5% level of significance to determine if there is enough evidence to support the district's claim.",
    f: { dist: 'z', mode: 'one', tail: 'right', m0: '75', xbar: '78', sd: '8', n: '100', claim: 'Average score is higher than 75' },
  },
  {
    label: 'Sample 4 · Full-time vs working students (Z two-sample)',
    slide: 'Sample 4',
    problemText: 'Fifty full time students were given an examination in Statistics and got an average grade of 95 with a variance of 10.5 while 50 working students have an average grade of 88 with a variance of 8.5. Is there a significant difference in the mean grade of the two groups at 0.05 level of significance?',
    f: { dist: 'z', mode: 'two', tail: 'two', spread: 'var', xbar1: '95', sd1: '10.5', n1: '50', xbar2: '88', sd2: '8.5', n2: '50', claim: 'Mean grades of the two groups differ' },
  },
  {
    label: 'Sample 5 · Light bulbs (t one-sample)',
    slide: 'Sample 5',
    problemText: 'A firm produces light bulbs having an average life span of 725 hours and with a standard deviation of 40 hours. If a random sample of 20 bulbs has an average life span of 700 hours, test the hypothesis that the life span of the lightbulbs is less than 725 hours.',
    f: { dist: 't', mode: 'one', tail: 'left', m0: '725', xbar: '700', sd: '40', n: '20', claim: 'Bulb life span is less than 725 hours' },
  },
  {
    label: 'Sample 6 · Coffee shop (t one-sample)',
    slide: 'Sample 6',
    problemText: "A coffee shop claims that the average waiting time for customers' orders is less than 4 minutes. To test this claim, a random sample of 25 orders is taken, and their waiting times are recorded. The sample mean waiting time is found to be 3.6 minutes with a sample standard deviation of 0.8 minutes. Conduct a one-tailed t-test at a 5% level of significance to determine if there is enough evidence to support the coffee shop's claim.",
    f: { dist: 't', mode: 'one', tail: 'left', m0: '4', xbar: '3.6', sd: '0.8', n: '25', claim: 'Average waiting time is less than 4 minutes' },
  },
  {
    label: 'Sample 7 · Public vs private school (t two-sample)',
    slide: 'Sample 7',
    problemText: 'Two samples are taken from two groups of students. Group 1 comes from public school and group 2 comes from private school. They were given examination in Chemistry subject and the results are shown below.\n\nGroup 1: n = 10, X̄₁ = 86, s₁² = 48\nGroup 2: n = 12, X̄₂ = 88, s₂² = 38\n\nTest whether the chemistry scores differ at the 0.05 level of significance.',
    f: { dist: 't', mode: 'two', tail: 'two', spread: 'var', xbar1: '86', sd1: '48', n1: '10', xbar2: '88', sd2: '38', n2: '12', claim: 'Chemistry scores differ' },
  },
  {
    label: 'Sample 8 · Teaching methods (t two-sample)',
    slide: 'Sample 8',
    problemText: 'An educational institute is implementing two teaching methods, A and B, for improving student performance in mathematics. They want to determine if method B leads to a higher average test score than method A. A sample of 30 students taught with method A has a mean test score of 75 with a standard deviation of 8. Another sample of 35 students taught with method B has a mean test score of 78 with a standard deviation of 7. Conduct a one-tailed t-test at a 5% level of significance to ascertain if method B results in a significantly higher average test score than method A.',
    f: { dist: 't', mode: 'two', tail: 'right', xbar1: '78', sd1: '7', n1: '35', xbar2: '75', sd2: '8', n2: '30', claim: 'Method B (sample 1) scores higher than Method A (sample 2)' },
  },
];

function hypotheses(f) {
  const sym = { two: ['=', '≠'], left: ['≥', '<'], right: ['≤', '>'] }[f.tail];
  const two = f.mode === 'two';
  const d0 = String(f.d0).trim() === '' ? '0' : f.d0;
  const L = two ? (Number(d0) === 0 ? 'μ₁' : 'μ₁ − μ₂') : 'μ';
  const R = two ? (Number(d0) === 0 ? 'μ₂' : d0) : (f.m0 === '' ? 'μ₀' : f.m0);
  return [`H₀: ${L} ${sym[0]} ${R}`, `H₁: ${L} ${sym[1]} ${R}`];
}

function hypothesisMath(f, alternative) {
  const symbols = { two: ['=', String.raw`\ne`], left: [String.raw`\ge`, '<'], right: [String.raw`\le`, '>'] }[f.tail];
  const two = f.mode === 'two';
  const difference = String(f.d0 ?? '').trim() === '' ? 0 : Number(f.d0);
  const lhs = two
    ? (difference === 0 ? String.raw`\mu_1` : String.raw`\mu_1-\mu_2`)
    : String.raw`\mu`;
  const rhs = two
    ? (difference === 0 ? String.raw`\mu_2` : String(difference))
    : (String(f.m0).trim() || String.raw`\mu_0`);
  return String.raw`H_${alternative}: ${lhs} ${symbols[alternative === '0' ? 0 : 1]} ${rhs}`;
}

function testStatisticMath(f) {
  const statistic = f.dist === 'z' ? 'z' : 't';
  const spread = f.dist === 'z' ? String.raw`\sigma` : 's';
  if (f.mode === 'one') {
    return String.raw`${statistic}=\frac{\bar{x}-\mu_0}{${spread}/\sqrt{n}}`;
  }
  return String.raw`${statistic}=\frac{(\bar{x}_1-\bar{x}_2)-D_0}{\sqrt{\frac{${spread}_1^2}{n_1}+\frac{${spread}_2^2}{n_2}}}`;
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

export default function ZTest({ onSave, initialProblem, onNavigate }) {
  const [f, setF] = useState(INIT);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const [problem, setProblem] = useState('');
  const [activeProblemLabel, setActiveProblemLabel] = useState('');
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
    if (onSave) {
      onSave({
        module: 'ztest',
        title: `${out.dist === 'z' ? 'Z' : 't'}-test (${out.mode}-sample): ${out.dist} = ${fmt(out.stat, 3)}, p = ${fmt(out.p)}`,
        detail: `${out.reject ? 'Reject' : 'Fail to reject'} H₀ at α = ${out.alpha}`,
      });
    }
  };

  const readProblem = () => {
    const p = parseProblem(problem);
    if (p.error) { setErr(p.error); setInfo(null); setRes(null); return; }
    const next = { ...INIT, ...p.fields };
    setF(next); setInfo(p); setRes(null);
    if (p.missing.length) { setErr(`I could not find: ${p.missing.join(', ')}. Please fill those in below, then press Solve.`); return; }
    setErr(''); run(next);
  };

  const loadExampleByIndex = (idx) => {
    const ex = EXAMPLES[idx];
    if (ex) {
      const next = { ...INIT, alpha: '0.05', ...ex.f };
      setF(next);
      setProblem(ex.problemText || '');
      setActiveProblemLabel(ex.label);
      setRes(null);
      setErr('');
      setInfo(null);
      run(next);
    }
  };

  const loadExample = (e) => {
    const idx = e.target.value;
    if (idx !== '') loadExampleByIndex(Number(idx));
    e.target.value = '';
  };

  useEffect(() => {
    if (initialProblem) {
      // Find matching example or load directly from initialProblem fields
      const next = {
        ...INIT,
        dist: initialProblem.dist || 'z',
        mode: initialProblem.mode || 'one',
        tail: initialProblem.tail || 'two',
        alpha: initialProblem.alpha || '0.05',
        spread: initialProblem.spread || 'sd',
        claim: initialProblem.claim || '',
        m0: initialProblem.m0 || '',
        xbar: initialProblem.xbar || '',
        sd: initialProblem.sd || '',
        n: initialProblem.n || '',
        xbar1: initialProblem.xbar1 || '',
        sd1: initialProblem.sd1 || '',
        n1: initialProblem.n1 || '',
        xbar2: initialProblem.xbar2 || '',
        sd2: initialProblem.sd2 || '',
        n2: initialProblem.n2 || '',
        d0: initialProblem.d0 || '0',
      };
      setF(next);
      setProblem(initialProblem.problem || initialProblem.problemText || '');
      setActiveProblemLabel(initialProblem.title || initialProblem.label || 'Loaded problem');
      setRes(null);
      setErr('');
      setInfo(null);
      run(next);
    }
  }, [initialProblem]);

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
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h1 className="pix" style={{ margin: '8px 0 16px' }}>Hypothesis Testing</h1>
        {onNavigate && (
          <button className="btn sm ghost" onClick={() => onNavigate('lessons')}>
            📖 View Hypothesis Lesson &amp; 7 Steps
          </button>
        )}
      </div>

      {/* Actual Given Word Problems Quick Select Bar */}
      <section className="card" style={{ border: '2px solid #5B3CD6', background: 'rgba(27, 19, 62, 0.9)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ margin: 0 }}>Actual Given Word Problems (Module Samples)</h2>
          <small style={{ color: '#B9A2FF' }}>Select any slide problem to auto-fill parameters, problem text &amp; solve</small>
        </div>
        <p style={{ margin: '8px 0 12px', fontSize: '0.92rem', color: '#D8E2F0' }}>
          Click an actual problem below to solve it instantly:
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex, idx) => {
            const isSelected = activeProblemLabel === ex.label;
            return (
              <button
                key={ex.slide}
                type="button"
                className={`btn sm ${isSelected ? '' : 'ghost'}`}
                onClick={() => loadExampleByIndex(idx)}
              >
                {isSelected ? '✓ ' : ''}{ex.slide}: {ex.f.dist.toUpperCase()} ({ex.f.mode})
              </button>
            );
          })}
        </div>

        {problem && (
          <div style={{ marginTop: 14, background: '#110B29', border: '1.5px solid #3F2B85', borderRadius: 10, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span className="badge on" style={{ fontSize: '0.72rem' }}>Active Word Problem</span>
              {activeProblemLabel && <small style={{ color: '#FFE9A8' }}>{activeProblemLabel}</small>}
            </div>
            <p style={{ margin: 0, color: '#EDE8FF', fontSize: '0.94rem', whiteSpace: 'pre-line' }}>{problem}</p>
          </div>
        )}
      </section>

      <div className="grid2">
        <section className="card">
          <h2>1. Set up the test</h2>
          <div className="paste">
            <label>Paste the whole problem and I will read it for you
              <textarea rows="4" value={problem} onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g. A coffee shop claims the average waiting time is less than 4 minutes. A random sample of 25 orders has a mean of 3.6 minutes and a sample standard deviation of 0.8 minutes. Test at the 5% level of significance." />
            </label>
            <div className="row">
              <button className="btn sm" onClick={readProblem} disabled={!problem.trim()}>Read &amp; solve</button>
              <button className="btn ghost sm" onClick={() => { setProblem(''); setActiveProblemLabel(''); setInfo(null); }}>Clear</button>
            </div>
            {info && (
              <div className="found" role="status" style={{ marginTop: 10 }}>
                <b>Here is what I understood:</b>
                <ul>{info.found.map((t) => <li key={t}>{t}</li>)}</ul>
                {info.notes.map((n) => <p key={n} className="note">Note: {n}</p>)}
                <small>Anything wrong? Fix it in the boxes below and press Solve.</small>
              </div>
            )}
            <p className="or">— or enter / configure manually —</p>
          </div>

          <label>Load from class examples dropdown
            <select defaultValue="" onChange={loadExample}>
              <option value="" disabled>Choose a problem from Module…</option>
              {EXAMPLES.map((ex, i) => <option key={ex.label} value={i}>{ex.label}</option>)}
            </select>
          </label>

          {toggle('dist', [['z', 'Z-test'], ['t', 't-test']])}
          {toggle('mode', [['one', 'One-sample'], ['two', 'Two-sample']])}
          <p className="note">
            {isZ ? 'Z-test: use when n ≥ 30 or σ is known. ' : 't-test: use when σ is unknown or n < 30 (uses s and df). '}
            {two ? 'Assumes two independent samples from normal populations.' : 'Assumes a normal population or a large sample.'}
          </p>

          <label>What are you testing? (optional claim)<input value={f.claim} onChange={set('claim')} placeholder="e.g. Average waiting time is less than 4 minutes" /></label>
          <label>Test type (tail)
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
          {lowN && <p className="note">Warning: Your module uses the Z-test only when n ≥ 30. With a smaller sample, consider the t-test.</p>}
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn" onClick={() => run()}>Solve</button>
            <button className="btn ghost" onClick={() => pick({ ...INIT, dist: f.dist, mode: f.mode })}>Reset</button>
          </div>
          {err && <p className="err" role="alert" style={{ marginTop: 12 }}>Warning: {err}</p>}
        </section>

        <section className="card">
          <h2>2. Solution (7 steps)</h2>
          {!res ? <p>Fill in the form (or load a class example above) and press Solve.</p> : (
            <>
              <div className="stats">
                <div><small>{S}-statistic</small><b>{fmt(res.stat)}</b></div>
                <div><small>Critical value(s)</small><b>{res.crit.map((c) => fmt(c)).join(', ')}</b></div>
                <div><small>p-value</small><b>{fmt(res.p, 6)}</b></div>
                {res.df != null && <div><small>df</small><b>{fmt(res.df, 2)}</b></div>}
              </div>
              <div className="formula-grid sq-test-formulas">
                <Formula title="Null hypothesis" math={hypothesisMath(f, '0')} />
                <Formula title="Alternative hypothesis" math={hypothesisMath(f, '1')} />
                <Formula title="Test statistic" math={testStatisticMath(f)} />
              </div>
              <p className={'verdict ' + (res.reject ? 'rej' : 'ftr')}>{res.reject ? 'Reject H₀' : 'Fail to reject H₀'}</p>
              <ol className="steps">
                {steps.map(([t, b]) => <li key={t}><b>{t}</b><br />{b}</li>)}
              </ol>
              <p className="note">Statistical significance is not the same as practical importance.</p>
              <button className="btn ghost" onClick={() => download('hypothesis-test.txt', summary())}>Download solution</button>
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
