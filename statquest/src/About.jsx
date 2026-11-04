import { InlineFormula } from './Formula';

export default function About({ onNavigate }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h1 className="pix" style={{ margin: '8px 0 16px' }}>How to Use StatQuest</h1>
        {onNavigate && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn sm ghost" onClick={() => onNavigate('lessons')}>
              Go to Learning Modules
            </button>
            <button className="btn sm" onClick={() => onNavigate('regression')}>
              Regression Tool
            </button>
            <button className="btn sm" onClick={() => onNavigate('ztest')}>
              Hypothesis Tool
            </button>
          </div>
        )}
      </div>

      {/* Purpose Overview */}
      <section className="card">
        <h2>Purpose</h2>
        <p>
          <b>StatQuest</b> is designed to help students master and calculate statistical analyses in
          <b> Simple Linear Regression</b> and <b>Hypothesis Testing (Z-tests and t-tests)</b> with
          instant calculation, step-by-step walkthroughs, and clear visual representations.
        </p>
      </section>

      {/* How to use Simple Linear Regression */}
      <section className="card">
        <h2>How to Use: Simple Linear Regression</h2>
        <p>Follow these steps to fit a line of best fit and explore the relationship between two variables:</p>
        <ol className="steps">
          <li>
            <b>Step 1: Enter your data or load an actual word problem</b>
            <br />
            You have three flexible ways to provide your data:
            <ul>
              <li><b>Load a given word problem:</b> Select from the dropdown to automatically populate the real problem scenario, variable labels, and data points.</li>
              <li><b>Manual input:</b> Type (X, Y) points row-by-row in the data table. Click <i>+ Add row</i> to add points or <i>Delete</i> to remove a row (minimum 3 points required).</li>
              <li><b>Quick paste:</b> Paste multiple points into the text area (one "X, Y" pair per line, e.g. <code>1, 52</code>) and click <i>Use pasted data</i>.</li>
            </ul>
          </li>
          <li>
            <b>Step 2: (Optional) Identify X and Y variables from a word problem</b>
            <br />
            If you're not sure which variable is independent (X) and which is dependent (Y), expand the word problem helper, paste your question, and click <i>Identify the variables</i>. StatQuest will detect the predictor and response variables for you. You can also manually type custom labels in the X and Y label boxes.
          </li>
          <li>
            <b>Step 3: Calculate and interpret statistical results</b>
            <br />
            Click <b>Calculate</b>. StatQuest computes:
            <ul>
              <li>The regression equation: <InlineFormula math={String.raw`\hat{Y}=a+bX`} /> (with your custom variable names).</li>
              <li>Slope (<InlineFormula math="b" />) and Y-intercept (<InlineFormula math="a" />).</li>
              <li>Pearson correlation coefficient (<InlineFormula math="r" />) and qualitative strength (weak, moderate, strong).</li>
              <li>Coefficient of determination (<InlineFormula math="R^2" />), explaining the percentage of variation in Y explained by X.</li>
            </ul>
          </li>
          <li>
            <b>Step 4: Inspect the scatter plot &amp; download report</b>
            <br />
            Review the generated interactive scatter plot with your observations and the fitted regression line. Click <b>Download results</b> to save a clean text report for homework or reference.
          </li>
        </ol>
      </section>

      {/* How to use Hypothesis Testing */}
      <section className="card">
        <h2>How to Use: Hypothesis Testing</h2>
        <p>Follow these steps to perform one-sample or two-sample Z-tests and t-tests in 7 standardized steps:</p>
        <ol className="steps">
          <li>
            <b>Step 1: Choose distribution &amp; sample mode</b>
            <br />
            <ul>
              <li><b>Z-test:</b> Use when population standard deviation (<InlineFormula math={String.raw`\sigma`} />) is known or sample size is large (<InlineFormula math={String.raw`n\ge30`} />).</li>
              <li><b>t-test:</b> Use when population standard deviation is unknown (sample <InlineFormula math="s" /> is used) or sample size is small (<InlineFormula math={String.raw`n<30`} />).</li>
              <li><b>One-sample vs. Two-sample:</b> Choose <i>One-sample</i> to test against a known constant (<InlineFormula math={String.raw`\mu_0`} />), or <i>Two-sample</i> to compare the means of two independent groups.</li>
            </ul>
          </li>
          <li>
            <b>Step 2: Load a class slide problem or paste the problem</b>
            <br />
            <ul>
              <li><b>Load a class example:</b> Select any given textbook problem (e.g. luggage weight, cereal boxes, coffee shop wait times) to auto-fill every parameter and the exact problem text.</li>
              <li><b>Automatic text parser:</b> Paste the complete word problem into the text box and click <i>Read &amp; solve</i>. StatQuest will parse the hypothesized mean, sample mean, standard deviation/variance, and sample size.</li>
              <li><b>Manual input:</b> Select your test direction (Two-tailed <InlineFormula math={String.raw`\ne`} />, Left-tailed <InlineFormula math={String.raw`\lt`} />, Right-tailed <InlineFormula math={String.raw`\gt`} />), significance level (<InlineFormula math={String.raw`\alpha=0.10,\ 0.05,\ 0.01`} />), and type in the sample numbers.</li>
            </ul>
          </li>
          <li>
            <b>Step 3: Review the 7-step solution</b>
            <br />
            Click <b>Solve</b> to generate the complete solution formatted according to standard course requirements:
            <ol style={{ marginTop: 6, paddingLeft: 20 }}>
              <li>State the null hypothesis (<InlineFormula math={String.raw`H_0`} />).</li>
              <li>State the alternative hypothesis (<InlineFormula math={String.raw`H_1`} />).</li>
              <li>Set the significance level <InlineFormula math={String.raw`\alpha`} /> (and confidence level <InlineFormula math={String.raw`1-\alpha`} />).</li>
              <li>Collect and summarize sample data.</li>
              <li>Calculate the test statistic (Z or t) with step-by-step arithmetic.</li>
              <li>Construct the rejection and acceptance regions with critical values.</li>
              <li>Draw a formal statistical conclusion (Reject <InlineFormula math={String.raw`H_0`} /> vs. Fail to reject <InlineFormula math={String.raw`H_0`} />) with an interpretive statement.</li>
            </ol>
          </li>
          <li>
            <b>Step 4: Visualize the rejection region on the curve &amp; download</b>
            <br />
            Examine the generated normal or Student's t distribution curve showing the critical cut-offs, shaded rejection tails, and green marker for your computed test statistic. Click <b>Download solution</b> to export your work.
          </li>
        </ol>
      </section>

      {/* How to track Expertise Levels */}
      <section className="card">
        <h2>How to Track: Expertise Levels &amp; Progress</h2>
        <p>StatQuest tracks your statistical practice and advances your expertise level as you solve problems:</p>
        <ul>
          <li>
            <b>Tiered Expertise Levels:</b> Advance through 5 competency tiers based on verified calculations:
            <ul>
              <li><b>Novice (Tier 1):</b> Starting your statistical journey (0 analyses).</li>
              <li><b>Practitioner (Tier 2):</b> Active hands-on problem solving (1–2 analyses).</li>
              <li><b>Proficient (Tier 3):</b> Competent in modeling and inference (3–5 analyses).</li>
              <li><b>Advanced (Tier 4):</b> Consistent analytical depth and interpretation (6–9 analyses).</li>
              <li><b>Master (Tier 5):</b> Comprehensive mastery of regression and hypothesis testing (10+ analyses).</li>
            </ul>
          </li>
          <li><b>Module-Specific Expertise:</b> Track your independent proficiency in Simple Linear Regression and Hypothesis Testing separately on your dashboard.</li>
          <li><b>Competency Milestones:</b> Unlock verified practice badges as you master one-sample, two-sample, and regression problems.</li>
          <li><b>Session History:</b> Review your last 20 calculations with timestamps and key findings on the Expertise Dashboard.</li>
        </ul>
      </section>

      {/* Input Formatting Guide */}
      <section className="card">
        <h2>Input Formatting Tips</h2>
        <ul>
          <li><b>Decimal values:</b> Enter decimals using periods (e.g. <code>3.14</code>, <code>0.05</code>).</li>
          <li><b>Standard deviation vs. Variance:</b> Use the dropdown selector in Hypothesis Testing to indicate whether your problem gives the standard deviation (<InlineFormula math={String.raw`\sigma`} /> or <InlineFormula math="s" />) or the variance (<InlineFormula math={String.raw`\sigma^2`} /> or <InlineFormula math="s^2" />).</li>
          <li><b>Pasting data in Regression:</b> Separate X and Y with either a comma or spaces (e.g. <code>1, 52</code> or <code>1 52</code>). One observation per line.</li>
          <li><b>Need formulas, theory, or glossary?</b> Visit the <b>Lessons</b> section in the navigation menu for complete learning modules with theoretical formulas, assumptions, and glossary definitions.</li>
        </ul>
      </section>
    </>
  );
}
