const GLOSSARY = [
  ['Slope (b)', 'Predicted change in Y for each 1-unit increase in X.'],
  ['Intercept (a)', 'Predicted Y when X = 0.'],
  ['Pearson r', 'Strength and direction of a linear relationship, from −1 to +1.'],
  ['R²', 'Share of the variation in Y explained by the regression line.'],
  ['Null hypothesis (H₀)', 'The default claim of "no difference / no effect".'],
  ['Alternative hypothesis (H₁)', 'The claim you look for evidence to support.'],
  ['α (significance level)', 'The risk of wrongly rejecting a true H₀ that you are willing to accept.'],
  ['p-value', 'Probability of a result at least this extreme if H₀ were true.'],
  ['Critical value', 'The z cut-off that marks where the rejection region begins.'],
];

export default function About() {
  return (
    <>
      <h1 className="pix"> About / How to use</h1>
      <section className="card">
        <h2>Purpose</h2>
        <p>StatQuest helps students run Simple Linear Regression and a one-sample Z-test with clear, step-by-step explanations.</p>
        <h2>How to use</h2>
        <ol>
          <li><b>Regression:</b> load a sample or type/paste your (X, Y) pairs, press Calculate, read the equation and interpretation, then download the results.</li>
          <li><b>Hypothesis test:</b> choose the tail and α, enter μ₀, x̄, σ and n, press Run test, and read the decision and the curve.</li>
        </ol>
      </section>
      <section className="card">
        <h2>Formulas</h2>
        <pre>{`b = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²        a = ȳ − b·x̄
r = Σ(x − x̄)(y − ȳ) / √[Σ(x − x̄)² · Σ(y − ȳ)²]
R² = 1 − SSE / SST
Z one-sample:  z = (x̄ − μ) / (σ/√n)
Z two-sample:  z = (x̄₁ − x̄₂) / √(σ₁²/n₁ + σ₂²/n₂)
t one-sample:  t = (x̄ − μ) / (s/√n),  df = n − 1
t two-sample:  t = (x̄₁ − x̄₂) / √(s₁²/n₁ + s₂²/n₂)
p: left Φ(z) · right 1 − Φ(z) · two-tailed 2·(1 − Φ(|z|))
Reject H₀ when p ≤ α (equivalently, z is in the rejection region)`}</pre>
        <h2>Assumptions and limitations</h2>
        <ul>
          <li>Regression assumes a roughly linear relationship; outliers can distort the line. Correlation is not causation.</li>
          <li>|r| thresholds: &lt;0.2 very weak, 0.2–0.39 weak, 0.4–0.59 moderate, 0.6–0.79 strong, ≥0.8 very strong.</li>
          <li>The Z-test requires a known σ and a normal population (or n ≥ 30). If σ is unknown, a t-test is needed; this app does not include one.</li>
          <li>We say "fail to reject H₀", never "accept H₀".</li>
        </ul>
      </section>
      <section className="card">
        <h2>Glossary</h2>
        <dl>{GLOSSARY.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}</dl>
      </section>
    </>
  );
}