import { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { regression, strength, parsePairs, parseText, fmt, download } from './stats';
import { identifyVariables } from './variables';

const SAMPLES = {
  'Worked example (5 points)': { pairs: [[1, 2], [2, 4], [3, 5], [4, 4], [5, 5]], x: '', y: '' },
  'Study hours vs. exam score': { pairs: [[1, 52], [2, 55], [3, 61], [4, 64], [5, 70], [6, 72], [7, 79], [8, 85]], x: 'Study hours', y: 'Exam score' },
  'TV hours vs. grade (negative)': { pairs: [[1, 90], [2, 86], [3, 83], [4, 75], [5, 72], [6, 65]], x: 'TV hours', y: 'Grade' },
};
const blank = () => ({ x: '', y: '' });

export default function Regression({ onSave }) {
  const [rows, setRows] = useState([blank(), blank(), blank()]);
  const [paste, setPaste] = useState('');
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const [names, setNames] = useState({ x: '', y: '' });
  const [problem, setProblem] = useState('');
  const [vars, setVars] = useState(null);
  const [swapped, setSwapped] = useState(false);

  const xn = names.x.trim() || 'X', yn = names.y.trim() || 'Y';
  const named = names.x.trim() && names.y.trim();

  const setCell = (i, k, v) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  const loadSample = (smp) => {
    setRows(smp.pairs.map(([x, y]) => ({ x: String(x), y: String(y) })));
    setNames({ x: smp.x, y: smp.y }); setRes(null); setErr('');
  };
  const fail = (m) => { setErr(m); setRes(null); };

  const identify = () => {
    const v = identifyVariables(problem);
    setVars(v); setSwapped(false);
    if (v.x && v.y) setNames({ x: v.x, y: v.y });
  };
  const swap = () => { setNames((n) => ({ x: n.y, y: n.x })); setSwapped((s) => !s); };

  const calc = () => {
    const { pts, error } = parsePairs(rows);
    if (error) return fail(error);
    const out = regression(pts);
    if (out.error) return fail(out.error);
    setErr(''); setRes({ ...out, pts });
    onSave({ module: 'regression', title: `Y = ${fmt(out.a)} + ${fmt(out.b)}X`, detail: `n = ${out.n}, R² = ${fmt(out.r2)}` });
  };
  const addPasted = () => {
    const parsed = parseText(paste);
    if (!parsed.length) return setErr('Paste lines like "3, 7" (one X, Y pair per line).');
    setRows(parsed); setErr(''); setRes(null);
  };
  const clear = () => { setRows([blank(), blank(), blank()]); setPaste(''); setRes(null); setErr(''); };

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
      <h1 className="pix">Simple Linear Regression</h1>
      <div className="grid2">
        <section className="card">
          <h2>1. Enter your data</h2>

          <details className="optional">
            <summary>💡 Optional: not sure which is X and which is Y? Paste the problem</summary>
            <label>Word problem
              <textarea rows="4" value={problem} onChange={(e) => setProblem(e.target.value)}
                placeholder="e.g. A teacher wants to know if the number of hours students study affects their exam scores." />
            </label>
            <button className="btn" onClick={identify} disabled={!problem.trim()}>Identify the variables</button>
            {vars && (vars.x ? (
              <div className="found" role="status">
                <p><b>Independent variable (X):</b> {names.x}<br /><b>Dependent variable (Y):</b> {names.y}</p>
                <p>{swapped ? 'You swapped the roles. ' : ''}{vars.reason}</p>
                {vars.guess && <p className="note">ℹ️ This is a best guess. Ask yourself: which variable am I trying to predict? That one is Y.</p>}
                <button className="btn ghost sm" onClick={swap}>⇄ Swap X and Y</button>
                <p><small>You still type the X and Y numbers yourself below.</small></p>
              </div>
            ) : <p className="note">{vars.message}</p>)}
          </details>

          <div className="pair">
            <label>X label (independent, optional)<input value={names.x} onChange={(e) => setNames({ ...names, x: e.target.value })} placeholder="e.g. Hours studied" /></label>
            <label>Y label (dependent, optional)<input value={names.y} onChange={(e) => setNames({ ...names, y: e.target.value })} placeholder="e.g. Exam score" /></label>
          </div>

          <label>Load a sample{' '}
            <select defaultValue="" onChange={(e) => e.target.value && loadSample(SAMPLES[e.target.value])}>
              <option value="" disabled>Choose…</option>
              {Object.keys(SAMPLES).map((k) => <option key={k}>{k}</option>)}
            </select>
          </label>
          <div className="tbl">
            <table>
              <thead><tr><th>#</th><th>X · {names.x.trim() || 'independent'}</th><th>Y · {names.y.trim() || 'dependent'}</th><th /></tr></thead>
              <tbody>{rows.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><input aria-label={`X ${i + 1}`} inputMode="decimal" value={r.x} onChange={(e) => setCell(i, 'x', e.target.value)} /></td>
                  <td><input aria-label={`Y ${i + 1}`} inputMode="decimal" value={r.y} onChange={(e) => setCell(i, 'y', e.target.value)} /></td>
                  <td><button className="btn ghost sm" aria-label={`Delete row ${i + 1}`} disabled={rows.length <= 1} onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>✕</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <button className="btn ghost" onClick={() => setRows((r) => [...r, blank()])}>+ Add row</button>
          <label>Or paste many points (one "X, Y" per line)
            <textarea rows="3" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={'1, 2\n2, 4\n3, 5'} />
          </label>
          <button className="btn ghost" onClick={addPasted}>Use pasted data</button>
          <div className="row">
            <button className="btn" onClick={calc}>Calculate ▶</button>
            <button className="btn ghost" onClick={clear}>Clear data</button>
          </div>
          {err && <p className="err" role="alert">⚠️ {err}</p>}
        </section>

        <section className="card">
          <h2>2. Results</h2>
          {!res ? <p>Enter at least 3 pairs and press Calculate. Your results will appear here.</p> : (
            <>
              <p className="big">{eq}</p>
              {named && <p>Predicted <b>{yn}</b> = {fmt(res.a)} {res.b < 0 ? '−' : '+'} {fmt(Math.abs(res.b))} × <b>{xn}</b></p>}
              <div className="stats">
                <div><small>Intercept (a)</small><b>{fmt(res.a)}</b></div>
                <div><small>Slope (b)</small><b>{fmt(res.b)}</b></div>
                <div><small>r</small><b>{fmt(res.r)}</b></div>
                <div><small>R²</small><b>{fmt(res.r2)}</b></div>
              </div>
              <p><b>Relationship:</b> {s.dir} {s.label}{Number.isFinite(res.r) ? ' linear relationship' : ''}.</p>
              <ul>
                <li><b>Slope:</b> each 1-unit increase in {xn} is associated with a {fmt(Math.abs(res.b))}-unit {res.b >= 0 ? 'increase' : 'decrease'} in predicted {yn}.</li>
                <li><b>Intercept:</b> predicted {yn} when {xn} = 0 is {fmt(res.a)} (only meaningful if {xn} = 0 makes sense for your data).</li>
                <li><b>r:</b> shows direction and strength of the straight-line relationship (−1 to +1).</li>
                <li><b>R²:</b> {Number.isFinite(res.r2) ? `${fmt(res.r2 * 100, 2)}% of the variation in ${yn} is explained by ${xn}.` : `undefined because ${yn} does not vary.`}</li>
              </ul>
              <p className="note">Correlation does not imply causation. Thresholds on |r|: &lt;0.2 very weak, 0.2–0.39 weak, 0.4–0.59 moderate, 0.6–0.79 strong, ≥0.8 very strong.</p>
              <button className="btn ghost" onClick={() => download('regression-results.txt', summary())}>⬇ Download results</button>
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