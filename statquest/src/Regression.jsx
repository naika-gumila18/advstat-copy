import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { regression, strength, parsePairs, parseText, fmt, download } from './stats';
import { identifyVariables } from './variables';
import { InlineFormula } from './Formula';

const SAMPLES = {
  'Worked example (5 points)': {
    title: 'Worked example (5 points)',
    problem: 'A researcher wants to find the linear relationship between variable X and variable Y using an observed 5-point sample: (1, 2), (2, 4), (3, 5), (4, 4), (5, 5). Find the regression line Y = a + bX, Pearson correlation coefficient r, and coefficient of determination R².',
    pairs: [[1, 2], [2, 4], [3, 5], [4, 4], [5, 5]],
    x: 'Predictor X',
    y: 'Response Y',
  },
  'Study hours vs. exam score': {
    title: 'Study hours vs. exam score',
    problem: 'A teacher wants to know if the number of hours students study affects their exam scores. Data from 8 students were collected: (1, 52), (2, 55), (3, 61), (4, 64), (5, 70), (6, 72), (7, 79), (8, 85). Find the regression line to predict exam score from study hours.',
    pairs: [[1, 52], [2, 55], [3, 61], [4, 64], [5, 70], [6, 72], [7, 79], [8, 85]],
    x: 'Study hours',
    y: 'Exam score',
  },
  'TV hours vs. grade': {
    title: 'TV hours vs. grade',
    problem: 'A researcher investigates the effect of daily TV viewing hours on students’ academic grades. A sample of 6 students yielded: (1, 90), (2, 86), (3, 83), (4, 75), (5, 72), (6, 65). Regress academic grade on TV hours.',
    pairs: [[1, 90], [2, 86], [3, 83], [4, 75], [5, 72], [6, 65]],
    x: 'TV hours',
    y: 'Grade',
  },
};

const blank = () => ({ x: '', y: '' });

export default function Regression({ onSave, initialProblem, onNavigate }) {
  const [rows, setRows] = useState([blank(), blank(), blank()]);
  const [paste, setPaste] = useState('');
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const [names, setNames] = useState({ x: '', y: '' });
  const [problem, setProblem] = useState('');
  const [activeProblemKey, setActiveProblemKey] = useState('');
  const [vars, setVars] = useState(null);
  const [swapped, setSwapped] = useState(false);

  const xn = names.x.trim() || 'X', yn = names.y.trim() || 'Y';
  const named = names.x.trim() && names.y.trim();

  const setCell = (i, k, v) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [k]: v } : row)));

  const runCalc = (currentRows = rows) => {
    const { pts, error } = parsePairs(currentRows);
    if (error) {
      setErr(error);
      setRes(null);
      return;
    }
    const out = regression(pts);
    if (out.error) {
      setErr(out.error);
      setRes(null);
      return;
    }
    setErr('');
    setRes({ ...out, pts });
    if (onSave) {
      onSave({
        module: 'regression',
        title: `Y = ${fmt(out.a)} + ${fmt(out.b)}X`,
        detail: `n = ${out.n}, R² = ${fmt(out.r2)}`,
      });
    }
  };

  const loadSample = (smp, keyName = '') => {
    const newRows = smp.pairs.map(([x, y]) => ({ x: String(x), y: String(y) }));
    const newNames = { x: smp.x || smp.xName || '', y: smp.y || smp.yName || '' };
    setRows(newRows);
    setNames(newNames);
    setProblem(smp.problem || '');
    setActiveProblemKey(keyName || smp.title || smp.id || '');
    setErr('');
    if (smp.problem) {
      const v = identifyVariables(smp.problem);
      setVars(v);
      setSwapped(false);
    } else {
      setVars(null);
    }
    runCalc(newRows, newNames);
  };

  useEffect(() => {
    if (initialProblem) {
      loadSample(initialProblem, initialProblem.title || initialProblem.id);
    }
  }, [initialProblem]);

  const identify = () => {
    const v = identifyVariables(problem);
    setVars(v);
    setSwapped(false);
    if (v.x && v.y) setNames({ x: v.x, y: v.y });
  };
  const swap = () => { setNames((n) => ({ x: n.y, y: n.x })); setSwapped((s) => !s); };

  const calc = () => {
    runCalc(rows, names);
  };

  const addPasted = () => {
    const parsed = parseText(paste);
    if (!parsed.length) return setErr('Paste lines like "3, 7" (one X, Y pair per line).');
    setRows(parsed);
    setErr('');
    setRes(null);
  };

  const clear = () => {
    setRows([blank(), blank(), blank()]);
    setPaste('');
    setProblem('');
    setActiveProblemKey('');
    setVars(null);
    setRes(null);
    setErr('');
  };

  const s = res && strength(res.r);
  const xs = res && res.pts.map((p) => p.x);
  const line = res && [Math.min(...xs), Math.max(...xs)].map((x) => ({ x, y: res.a + res.b * x }));
  const eq = res && `Y = ${fmt(res.a)} ${res.b < 0 ? '−' : '+'} ${fmt(Math.abs(res.b))}X`;

  const summary = () => res && [
    'StatQuest — Simple Linear Regression',
    ...(named ? [`Independent variable (X): ${names.x.trim()}`, `Dependent variable (Y): ${names.y.trim()}`] : []),
    `n = ${res.n}`, `Equation: ${eq}`,
    `Intercept (a) = ${fmt(res.a)}`, `Slope (b) = ${fmt(res.b)}`, `r = ${fmt(res.r)} (${s.dir} ${s.label})`, `R² = ${fmt(res.r2)}`,
    '', 'Data (X, Y):', ...res.pts.map((p) => `${p.x}, ${p.y}`),
  ].join('\n');

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h1 className="pix" style={{ margin: '8px 0 16px' }}>Simple Linear Regression</h1>
        {onNavigate && (
          <button className="btn sm ghost" onClick={() => onNavigate('lessons')}>
            📖 View Regression Lesson &amp; Formulas
          </button>
        )}
      </div>

      {/* Prominent Given Word Problems Bar */}
      <section className="card" style={{ border: '2px solid #5B3CD6', background: 'rgba(27, 19, 62, 0.9)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ margin: 0 }}>Actual Given Word Problems</h2>
          <small style={{ color: '#B9A2FF' }}>Select a textbook problem to auto-populate data &amp; variables</small>
        </div>
        <p style={{ margin: '8px 0 12px', fontSize: '0.92rem', color: '#D8E2F0' }}>
          Practice with the actual class word problems below:
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.keys(SAMPLES).map((key) => {
            const isSelected = activeProblemKey === key;
            return (
              <button
                key={key}
                type="button"
                className={`btn sm ${isSelected ? '' : 'ghost'}`}
                onClick={() => loadSample(SAMPLES[key], key)}
              >
                {isSelected ? '✓ ' : ''}{key}
              </button>
            );
          })}
        </div>

        {problem && (
          <div style={{ marginTop: 14, background: '#110B29', border: '1.5px solid #3F2B85', borderRadius: 10, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span className="badge on" style={{ fontSize: '0.72rem' }}>Active Word Problem</span>
              {activeProblemKey && <small style={{ color: '#FFE9A8' }}>{activeProblemKey}</small>}
            </div>
            <p style={{ margin: 0, color: '#EDE8FF', fontSize: '0.94rem' }}>{problem}</p>
          </div>
        )}
      </section>

      <div className="grid2">
        <section className="card">
          <h2>1. Enter your data</h2>

          <details className="optional" open={!activeProblemKey}>
            <summary>Word problem &amp; variable identifier (X vs Y)</summary>
            <label>Word problem text
              <textarea
                rows="4"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g. A teacher wants to know if the number of hours students study affects their exam scores."
              />
            </label>
            <button className="btn sm" onClick={identify} disabled={!problem.trim()}>
              Identify the variables
            </button>
            {vars && (vars.x ? (
              <div className="found" role="status" style={{ marginTop: 10 }}>
                <p><b>Independent variable (X):</b> {names.x}<br /><b>Dependent variable (Y):</b> {names.y}</p>
                <p>{swapped ? 'You swapped the roles. ' : ''}{vars.reason}</p>
                {vars.guess && <p className="note">Note: This is a best guess. Ask yourself: which variable am I trying to predict? That one is Y.</p>}
                <button className="btn ghost sm" onClick={swap}>Swap X and Y</button>
              </div>
            ) : <p className="note" style={{ marginTop: 10 }}>{vars.message}</p>)}
          </details>

          <div className="pair">
            <label>X label (independent, predictor)
              <input value={names.x} onChange={(e) => setNames({ ...names, x: e.target.value })} placeholder="e.g. Hours studied" />
            </label>
            <label>Y label (dependent, response)
              <input value={names.y} onChange={(e) => setNames({ ...names, y: e.target.value })} placeholder="e.g. Exam score" />
            </label>
          </div>

          <label>Or load from dropdown:
            <select
              value={activeProblemKey}
              onChange={(e) => e.target.value && loadSample(SAMPLES[e.target.value], e.target.value)}
            >
              <option value="" disabled>Choose a sample word problem…</option>
              {Object.keys(SAMPLES).map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>

          <div className="tbl">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>X · {names.x.trim() || 'independent'}</th>
                  <th>Y · {names.y.trim() || 'dependent'}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td><input aria-label={`X ${i + 1}`} inputMode="decimal" value={r.x} onChange={(e) => setCell(i, 'x', e.target.value)} /></td>
                    <td><input aria-label={`Y ${i + 1}`} inputMode="decimal" value={r.y} onChange={(e) => setCell(i, 'y', e.target.value)} /></td>
                    <td><button className="btn ghost sm" aria-label={`Delete row ${i + 1}`} disabled={rows.length <= 1} onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="btn ghost sm" onClick={() => setRows((r) => [...r, blank()])}>+ Add row</button>

          <label style={{ marginTop: 14 }}>Or paste many points (one "X, Y" per line)
            <textarea rows="3" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={'1, 2\n2, 4\n3, 5'} />
          </label>
          <button className="btn ghost sm" onClick={addPasted}>Use pasted data</button>

          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn" onClick={calc}>Calculate</button>
            <button className="btn ghost" onClick={clear}>Clear data</button>
          </div>
          {err && <p className="err" role="alert" style={{ marginTop: 12 }}>Warning: {err}</p>}
        </section>

        <section className="card">
          <h2>2. Results</h2>
          {!res ? (
            <p>Enter at least 3 pairs (or select a given word problem above) and press Calculate. Your results will appear here.</p>
          ) : (
            <>
              <p className="big math-result">
                <InlineFormula
                  math={String.raw`\hat{Y}=${fmt(res.a)}${res.b < 0 ? '-' : '+'}${fmt(Math.abs(res.b))}X`}
                />
              </p>
              {named && (
                <p>
                  Predicted <b>{yn}</b> = {fmt(res.a)} {res.b < 0 ? '−' : '+'} {fmt(Math.abs(res.b))} × <b>{xn}</b>
                </p>
              )}
              <div className="stats">
                <div><small>Intercept (a)</small><b>{fmt(res.a)}</b></div>
                <div><small>Slope (b)</small><b>{fmt(res.b)}</b></div>
                <div><small>Pearson r</small><b>{fmt(res.r)}</b></div>
                <div><small>R²</small><b>{fmt(res.r2)}</b></div>
              </div>
              <p><b>Relationship:</b> {s.dir} {s.label}{Number.isFinite(res.r) ? ' linear relationship' : ''}.</p>
              <ul>
                <li><b>Slope (b = {fmt(res.b)}):</b> each 1-unit increase in {xn} is associated with an estimated {fmt(Math.abs(res.b))}-unit {res.b >= 0 ? 'increase' : 'decrease'} in predicted {yn}.</li>
                <li><b>Intercept (a = {fmt(res.a)}):</b> predicted {yn} when {xn} = 0 is {fmt(res.a)} (baseline value).</li>
                <li><b>Pearson r ({fmt(res.r)}):</b> shows direction and strength of the straight-line relationship (−1 to +1).</li>
                <li><b>R² ({fmt(res.r2)}):</b> {Number.isFinite(res.r2) ? `${fmt(res.r2 * 100, 2)}% of the total variation in ${yn} is explained by ${xn}.` : `undefined because ${yn} does not vary.`}</li>
              </ul>
              <p className="note">Correlation does not imply causation. Thresholds on |r|: &lt;0.2 very weak, 0.2–0.39 weak, 0.4–0.59 moderate, 0.6–0.79 strong, ≥0.8 very strong.</p>
              <button className="btn ghost" onClick={() => download('regression-results.txt', summary())}>Download results</button>
            </>
          )}
        </section>
      </div>

      {res && (
        <section className="card">
          <h2>3. Scatter plot with fitted line</h2>
          <ResponsiveContainer width="100%" height={340}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name={xn} domain={['auto', 'auto']} label={{ value: `X: ${xn}`, position: 'insideBottom', offset: -15 }} />
              <YAxis type="number" dataKey="y" name={yn} domain={['auto', 'auto']} label={{ value: `Y: ${yn}`, angle: -90, position: 'insideLeft' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend verticalAlign="top" />
              <Scatter name="Observations" data={res.pts} fill="#7C4DFF" />
              <Scatter name={`Fitted line: ${eq} (R² = ${fmt(res.r2, 3)})`} data={line} fill="#FF6B8A" line={{ stroke: '#FF6B8A', strokeWidth: 3 }} shape={() => <g />} legendType="line" />
            </ScatterChart>
          </ResponsiveContainer>
        </section>
      )}
    </>
  );
}
