import { useState } from 'react';
import Formula from './Formula';

const REGRESSION_GLOSSARY = [
  ['Slope (b)', 'The predicted change in the dependent variable (Y) for each 1-unit increase in the independent variable (X).'],
  ['Intercept (a)', 'The predicted value of Y when X is equal to 0 (baseline value).'],
  ['Pearson correlation (r)', 'Measures the strength and direction of a linear relationship between two variables, ranging from −1 to +1.'],
  ['Coefficient of determination (R²)', 'The proportion of total variation in Y that is explained by the regression line with X (from 0 to 1, or 0% to 100%).'],
  ['Independent variable (X)', 'The predictor, explanatory, or input variable manipulated or observed to explain changes in Y.'],
  ['Dependent variable (Y)', 'The response, outcome, or criterion variable being predicted or explained.'],
  ['Least Squares Principle', 'The method that finds the best line by minimizing the sum of the squared vertical distances (residuals) between data points and the line.'],
];

const HYPOTHESIS_GLOSSARY = [
  ['Null hypothesis (H₀)', 'The baseline or default claim stating there is "no effect", "no difference", or "no change" in the population parameter.'],
  ['Alternative hypothesis (H₁)', 'The research claim you want to test and look for evidence to support (two-tailed ≠, left-tailed <, or right-tailed >).'],
  ['Significance level (α)', 'The maximum allowable risk of making a Type I error (rejecting a true null hypothesis). Commonly set to 0.05, 0.01, or 0.10.'],
  ['p-value', 'The probability of obtaining sample results at least as extreme as those observed, assuming the null hypothesis is true.'],
  ['Critical value', 'The cutoff value on the Z or t distribution that defines the boundary where the rejection region begins.'],
  ['Test statistic (Z or t)', 'A standardized score calculated from sample data that measures how far the sample estimate deviates from the hypothesized value under H₀.'],
  ['Rejection region', 'The set of values of the test statistic that leads to the rejection of the null hypothesis.'],
  ['Degrees of freedom (df)', 'The number of independent pieces of information available for estimating a parameter (e.g. n − 1 for one-sample t-test).'],
  ['Type I error', 'Rejecting the null hypothesis when it is actually true (false positive, probability = α).'],
  ['Type II error', 'Failing to reject the null hypothesis when it is false (false negative, probability = β).'],
];

const REGRESSION_PROBLEMS = [
  {
    id: 'worked-example',
    title: 'Worked Example',
    problem:
      'A researcher wants to find the linear relationship between variable X and variable Y using an observed 5-point sample: (1, 2), (2, 4), (3, 5), (4, 4), (5, 5). Determine the regression equation Y = a + bX, the Pearson correlation coefficient r, and the coefficient of determination R².',
    xName: 'X (Predictor)',
    yName: 'Y (Response)',
    pairs: [[1, 2], [2, 4], [3, 5], [4, 4], [5, 5]],
    stats: {
      n: 5,
      xbar: '3.00',
      ybar: '4.00',
      b: '0.60',
      a: '2.20',
      eq: 'Y = 2.20 + 0.60X',
      r: '0.7746',
      rStrength: 'Strong positive linear relationship',
      r2: '0.6000 (60.0% of variation in Y explained by X)',
    },
    steps: [
      'Calculate sample means: x̄ = (1+2+3+4+5)/5 = 3, ȳ = (2+4+5+4+5)/5 = 4.',
      'Compute sum of squares: Σ(x − x̄)² = (1−3)² + (2−3)² + (3−3)² + (4−3)² + (5−3)² = 4 + 1 + 0 + 1 + 4 = 10.',
      'Compute cross-products: Σ(x − x̄)(y − ȳ) = (−2)(−2) + (−1)(0) + (0)(1) + (1)(0) + (2)(1) = 4 + 0 + 0 + 0 + 2 = 6.',
      'Compute slope: b = 6 / 10 = 0.60.',
      'Compute intercept: a = ȳ − b·x̄ = 4 − 0.60(3) = 4 − 1.80 = 2.20.',
      'Resulting regression equation: Y = 2.20 + 0.60X.',
      'Pearson r = 6 / √[10 × 6] = 6 / √60 ≈ 0.7746 (strong positive correlation). R² = (0.7746)² = 0.60.',
    ],
  },
  {
    id: 'study-hours',
    title: 'Study Hours vs. Exam Score',
    problem:
      'A teacher wants to know if the number of hours students study affects their exam scores. Data from 8 students were collected: (1, 52), (2, 55), (3, 61), (4, 64), (5, 70), (6, 72), (7, 79), (8, 85). Determine the regression equation to predict exam score from study hours, and assess the correlation strength and coefficient of determination.',
    xName: 'Study hours',
    yName: 'Exam score',
    pairs: [[1, 52], [2, 55], [3, 61], [4, 64], [5, 70], [6, 72], [7, 79], [8, 85]],
    stats: {
      n: 8,
      xbar: '4.50 hrs',
      ybar: '67.25 pts',
      b: '4.714',
      a: '47.107',
      eq: 'Predicted Exam score = 47.11 + 4.71 × (Study hours)',
      r: '0.9915',
      rStrength: 'Very strong positive linear relationship',
      r2: '0.9831 (98.31% of variation in exam score explained by study hours)',
    },
    steps: [
      'Independent variable (X): Study hours. Dependent variable (Y): Exam score.',
      'Sample means: x̄ = 4.50 hours, ȳ = 67.25 points.',
      'Slope calculation: b = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)² = 198 / 42 ≈ 4.714. For every extra hour studied, the exam score increases by an estimated 4.71 points.',
      'Intercept calculation: a = ȳ − b·x̄ = 67.25 − 4.714(4.5) ≈ 47.107 (baseline score with 0 study hours).',
      'Correlation: r = 0.9915, indicating an almost perfect positive linear relationship.',
      'R² = 0.9831: 98.31% of the variation in exam scores is directly accounted for by study hours.',
    ],
  },
  {
    id: 'tv-hours',
    title: 'TV Viewing Hours vs. Academic Grade',
    problem:
      'A researcher investigates the effect of daily TV viewing hours on students’ academic grades. A sample of 6 students yielded: (1, 90), (2, 86), (3, 83), (4, 75), (5, 72), (6, 65). Regress academic grade on TV hours and determine the linear equation, direction of correlation, and R².',
    xName: 'TV hours',
    yName: 'Grade',
    pairs: [[1, 90], [2, 86], [3, 83], [4, 75], [5, 72], [6, 65]],
    stats: {
      n: 6,
      xbar: '3.50 hrs',
      ybar: '78.50',
      b: '-4.857',
      a: '94.667',
      eq: 'Predicted Grade = 94.67 − 4.86 × (TV hours)',
      r: '-0.9845',
      rStrength: 'Very strong negative linear relationship',
      r2: '0.9692 (96.92% of variation in grade explained by TV hours)',
    },
    steps: [
      'Independent variable (X): TV viewing hours. Dependent variable (Y): Academic grade.',
      'Sample means: x̄ = 3.50 hours, ȳ = 78.50.',
      'Slope calculation: b = −85 / 17.5 = −4.857. Each additional hour of TV watched per day is associated with an expected decrease of 4.86 points in academic grade.',
      'Intercept calculation: a = 78.50 − (−4.857)(3.50) = 94.667 (predicted grade for 0 hours of TV).',
      'Correlation: r = −0.9845 (very strong inverse linear relationship).',
      'R² = 0.9692: 96.92% of grade variance is explained by TV viewing hours.',
    ],
  },
];

const HYPOTHESIS_PROBLEMS = [
  {
    id: 's11',
    slide: 'Sample 1',
    title: 'Traveler Luggage Weight',
    testType: 'Z-test (One-sample, Two-tailed)',
    problem:
      'A traveler claims that the average weight of his luggage is 40 kilos with a standard deviation of 9.5 kilos. Would you agree to this claim if a random sample of 50 luggage showed an average weight of 38 kilos using 0.05 level of significance?',
    given: 'μ₀ = 40, σ = 9.5, n = 50, x̄ = 38, α = 0.05, Two-tailed (≠)',
    steps: [
      ['Step 1 · Null Hypothesis', 'H₀: μ = 40 kg (Average luggage weight is 40 kg)'],
      ['Step 2 · Alternative Hypothesis', 'H₁: μ ≠ 40 kg (Average luggage weight differs from 40 kg)'],
      ['Step 3 · Significance Level', 'α = 0.05 (Confidence level = 95%)'],
      ['Step 4 · Sample Data', 'μ₀ = 40, x̄ = 38, σ = 9.5, n = 50'],
      ['Step 5 · Test Statistic', 'z = (x̄ − μ₀) / (σ/√n) = (38 − 40) / (9.5/√50) = −2 / 1.3435 = −1.4887'],
      ['Step 6 · Critical Values', 'Two-tailed Z at α = 0.05: critical values are ±1.960. Rejection region: z < −1.960 or z > 1.960'],
      ['Step 7 · Conclusion', 'z = −1.49 falls inside the acceptance region (−1.960 < −1.49 < 1.960). p-value = 0.1366 > 0.05. Fail to reject H₀. There is insufficient evidence to dispute the traveler’s claim.'],
    ],
    verdict: 'Fail to reject H₀',
    dist: 'z', mode: 'one', tail: 'two', m0: '40', xbar: '38', sd: '9.5', n: '50', claim: 'Average luggage weight is 40 kg', alpha: '0.05',
  },
  {
    id: 's12',
    slide: 'Sample 2',
    title: 'Cereal Box Packaging Weight',
    testType: 'Z-test (One-sample, Two-tailed)',
    problem:
      "A manufacturer claims that the mean weight of their cereal boxes is 500 grams. To test this claim, a random sample of 36 cereal boxes is selected, and their weights are recorded. The sample mean weight is found to be 495 grams with a known population standard deviation of 10 grams. At a 5% level of significance, can you conclude that the mean weight of the cereal boxes is different from the manufacturer's claim?",
    given: 'μ₀ = 500, σ = 10, n = 36, x̄ = 495, α = 0.05, Two-tailed (≠)',
    steps: [
      ['Step 1 · Null Hypothesis', 'H₀: μ = 500 g (Mean weight is 500 g)'],
      ['Step 2 · Alternative Hypothesis', 'H₁: μ ≠ 500 g (Mean weight is different from 500 g)'],
      ['Step 3 · Significance Level', 'α = 0.05'],
      ['Step 4 · Sample Data', 'μ₀ = 500, x̄ = 495, σ = 10, n = 36'],
      ['Step 5 · Test Statistic', 'z = (495 − 500) / (10/√36) = −5 / (10/6) = −5 / 1.6667 = −3.0000'],
      ['Step 6 · Critical Values', 'Two-tailed Z at α = 0.05: critical values are ±1.960. Rejection region: z < −1.960 or z > 1.960'],
      ['Step 7 · Conclusion', 'z = −3.00 falls in the lower rejection region (−3.00 < −1.960). p-value = 0.0027 ≤ 0.05. Reject H₀. There is sufficient statistical evidence that the mean weight differs from 500 grams.'],
    ],
    verdict: 'Reject H₀',
    dist: 'z', mode: 'one', tail: 'two', m0: '500', xbar: '495', sd: '10', n: '36', claim: 'Mean cereal box weight is 500 g', alpha: '0.05',
  },
  {
    id: 's13',
    slide: 'Sample 3',
    title: 'School District Standardized Test Scores',
    testType: 'Z-test (One-sample, Right-tailed)',
    problem:
      "A school district claims that the average score of its students in a standardized test is higher than 75. To test this claim, a random sample of 100 students is taken, and their average score is found to be 78 with a known population standard deviation of 8. Conduct a one-tailed z-test at a 5% level of significance to determine if there is enough evidence to support the district's claim.",
    given: 'μ₀ = 75, σ = 8, n = 100, x̄ = 78, α = 0.05, Right-tailed (>)',
    steps: [
      ['Step 1 · Null Hypothesis', 'H₀: μ ≤ 75 (Average score is 75 or lower)'],
      ['Step 2 · Alternative Hypothesis', 'H₁: μ > 75 (Average score is higher than 75)'],
      ['Step 3 · Significance Level', 'α = 0.05'],
      ['Step 4 · Sample Data', 'μ₀ = 75, x̄ = 78, σ = 8, n = 100'],
      ['Step 5 · Test Statistic', 'z = (78 − 75) / (8/√100) = 3 / 0.8 = +3.7500'],
      ['Step 6 · Critical Values', 'Right-tailed Z at α = 0.05: critical value is +1.645. Rejection region: z > 1.645'],
      ['Step 7 · Conclusion', 'z = +3.75 falls in the rejection region (+3.75 > 1.645). p-value = 0.000088 ≤ 0.05. Reject H₀. There is strong evidence to support the district’s claim that average scores exceed 75.'],
    ],
    verdict: 'Reject H₀',
    dist: 'z', mode: 'one', tail: 'right', m0: '75', xbar: '78', sd: '8', n: '100', claim: 'Average score is higher than 75', alpha: '0.05',
  },
  {
    id: 's15',
    slide: 'Sample 4',
    title: 'Full-time vs. Working Students Exam Grades',
    testType: 'Z-test (Two-sample, Two-tailed, Given Variances)',
    problem:
      'Fifty full time students were given an examination in Statistics and got an average grade of 95 with a variance of 10.5 while 50 working students have an average grade of 88 with a variance of 8.5. Is there a significant difference in the mean grade of the two groups at 0.05 level of significance?',
    given: 'x̄₁ = 95, σ₁² = 10.5, n₁ = 50; x̄₂ = 88, σ₂² = 8.5, n₂ = 50, α = 0.05, Two-tailed (≠)',
    steps: [
      ['Step 1 · Null Hypothesis', 'H₀: μ₁ = μ₂ (No difference in mean grade between full-time and working students)'],
      ['Step 2 · Alternative Hypothesis', 'H₁: μ₁ ≠ μ₂ (Mean grades of the two groups differ significantly)'],
      ['Step 3 · Significance Level', 'α = 0.05'],
      ['Step 4 · Sample Data', 'Sample 1: x̄₁ = 95, σ₁² = 10.5, n₁ = 50. Sample 2: x̄₂ = 88, σ₂² = 8.5, n₂ = 50.'],
      ['Step 5 · Test Statistic', 'Standard error = √(10.5/50 + 8.5/50) = √(0.21 + 0.17) = √0.38 ≈ 0.6164. z = (95 − 88) / 0.6164 = 7 / 0.6164 = 11.356'],
      ['Step 6 · Critical Values', 'Critical values for two-tailed Z at α = 0.05: ±1.960. Rejection region: z < −1.960 or z > 1.960'],
      ['Step 7 · Conclusion', 'z = 11.36 is far out in the upper rejection region. p-value < 0.0001. Reject H₀. There is a statistically significant difference between full-time and working student grades.'],
    ],
    verdict: 'Reject H₀',
    dist: 'z', mode: 'two', tail: 'two', spread: 'var', xbar1: '95', sd1: '10.5', n1: '50', xbar2: '88', sd2: '8.5', n2: '50', claim: 'Mean grades of the two groups differ', alpha: '0.05',
  },
  {
    id: 's18',
    slide: 'Sample 5',
    title: 'Light Bulb Life Span',
    testType: 't-test (One-sample, Left-tailed, n < 30)',
    problem:
      'A firm produces light bulbs having an average life span of 725 hours and with a standard deviation of 40 hours. If a random sample of 20 bulbs has an average life span of 700 hours, test the hypothesis that the life span of the lightbulbs is less than 725 hours at 0.05 level of significance.',
    given: 'μ₀ = 725, s = 40, n = 20, x̄ = 700, α = 0.05, Left-tailed (<), df = 19',
    steps: [
      ['Step 1 · Null Hypothesis', 'H₀: μ ≥ 725 hours (Average life span is at least 725 hours)'],
      ['Step 2 · Alternative Hypothesis', 'H₁: μ < 725 hours (Life span is less than 725 hours)'],
      ['Step 3 · Significance Level', 'α = 0.05'],
      ['Step 4 · Sample Data', 'μ₀ = 725, x̄ = 700, s = 40, n = 20, df = 20 − 1 = 19'],
      ['Step 5 · Test Statistic', 't = (700 − 725) / (40/√20) = −25 / (40/4.4721) = −25 / 8.9443 = −2.7951'],
      ['Step 6 · Critical Values', 'Left-tailed t-test with df = 19 at α = 0.05: critical value is t_crit = −1.7291. Rejection region: t < −1.7291'],
      ['Step 7 · Conclusion', 't = −2.80 falls inside the rejection region (−2.7951 < −1.7291). p-value = 0.0057 ≤ 0.05. Reject H₀. The sample provides sufficient evidence that bulb life span is under 725 hours.'],
    ],
    verdict: 'Reject H₀',
    dist: 't', mode: 'one', tail: 'left', m0: '725', xbar: '700', sd: '40', n: '20', claim: 'Bulb life span is less than 725 hours', alpha: '0.05',
  },
  {
    id: 's19',
    slide: 'Sample 6',
    title: 'Coffee Shop Customer Waiting Time',
    testType: 't-test (One-sample, Left-tailed, n = 25)',
    problem:
      "A coffee shop claims that the average waiting time for customers' orders is less than 4 minutes. To test this claim, a random sample of 25 orders is taken, and their waiting times are recorded. The sample mean waiting time is found to be 3.6 minutes with a sample standard deviation of 0.8 minutes. Conduct a one-tailed t-test at a 5% level of significance to determine if there is enough evidence to support the coffee shop's claim.",
    given: 'μ₀ = 4.0, s = 0.8, n = 25, x̄ = 3.6, α = 0.05, Left-tailed (<), df = 24',
    steps: [
      ['Step 1 · Null Hypothesis', 'H₀: μ ≥ 4.0 minutes (Average waiting time is at least 4 minutes)'],
      ['Step 2 · Alternative Hypothesis', 'H₁: μ < 4.0 minutes (Average waiting time is less than 4 minutes)'],
      ['Step 3 · Significance Level', 'α = 0.05'],
      ['Step 4 · Sample Data', 'μ₀ = 4, x̄ = 3.6, s = 0.8, n = 25, df = 24'],
      ['Step 5 · Test Statistic', 't = (3.6 − 4.0) / (0.8/√25) = −0.4 / (0.8/5) = −0.4 / 0.16 = −2.5000'],
      ['Step 6 · Critical Values', 'Left-tailed t-test with df = 24 at α = 0.05: critical value is t_crit = −1.7109. Rejection region: t < −1.7109'],
      ['Step 7 · Conclusion', 't = −2.50 falls in the rejection region (−2.50 < −1.7109). p-value = 0.0100 ≤ 0.05. Reject H₀. There is sufficient evidence to support the coffee shop’s claim that wait time is under 4 minutes.'],
    ],
    verdict: 'Reject H₀',
    dist: 't', mode: 'one', tail: 'left', m0: '4', xbar: '3.6', sd: '0.8', n: '25', claim: 'Average waiting time is less than 4 minutes', alpha: '0.05',
  },
  {
    id: 's21',
    slide: 'Sample 7',
    title: 'Public vs. Private School Chemistry Scores',
    testType: 't-test (Two-sample, Two-tailed, Given Sample Variances)',
    problem:
      'Two samples are taken from two groups of students. Group 1 comes from public school and group 2 comes from private school. They were given an examination in Chemistry subject and the results are shown below.\nGroup 1: n₁ = 10, X̄₁ = 86, s₁² = 48\nGroup 2: n₂ = 12, X̄₂ = 88, s₂² = 38\nTest whether chemistry scores between public and private schools differ significantly at 0.05 level of significance.',
    given: 'x̄₁ = 86, s₁² = 48, n₁ = 10; x̄₂ = 88, s₂² = 38, n₂ = 12, α = 0.05, Two-tailed (≠), df = 20',
    steps: [
      ['Step 1 · Null Hypothesis', 'H₀: μ₁ = μ₂ (No significant difference in chemistry scores between the two schools)'],
      ['Step 2 · Alternative Hypothesis', 'H₁: μ₁ ≠ μ₂ (Chemistry scores differ between public and private schools)'],
      ['Step 3 · Significance Level', 'α = 0.05'],
      ['Step 4 · Sample Data', 'Sample 1: x̄₁ = 86, s₁² = 48, n₁ = 10. Sample 2: x̄₂ = 88, s₂² = 38, n₂ = 12. df = 10 + 12 − 2 = 20.'],
      ['Step 5 · Test Statistic', 'Standard error = √(48/10 + 38/12) = √(4.8 + 3.167) = √7.967 ≈ 2.8225. t = (86 − 88) / 2.8225 = −2 / 2.8225 = −0.7086'],
      ['Step 6 · Critical Values', 'Two-tailed t-test with df = 20 at α = 0.05: critical values are ±2.0860. Rejection region: t < −2.0860 or t > 2.0860'],
      ['Step 7 · Conclusion', 't = −0.71 falls inside the acceptance region (−2.0860 < −0.71 < 2.0860). p-value = 0.4868 > 0.05. Fail to reject H₀. There is no statistically significant difference in chemistry scores between public and private students.'],
    ],
    verdict: 'Fail to reject H₀',
    dist: 't', mode: 'two', tail: 'two', spread: 'var', xbar1: '86', sd1: '48', n1: '10', xbar2: '88', sd2: '38', n2: '12', claim: 'Chemistry scores differ', alpha: '0.05',
  },
  {
    id: 's22',
    slide: 'Sample 9',
    title: 'Mathematics Teaching Methods A and B',
    testType: 't-test (Two-sample, One-tailed, Right-tailed)',
    problem:
      'An educational institute is implementing two teaching methods, A and B, for improving student performance in mathematics. They want to determine if method B leads to a higher average test score than method A. A sample of 30 students taught with method A has a mean test score of 75 with a standard deviation of 8. Another sample of 35 students taught with method B has a mean test score of 78 with a standard deviation of 7. Conduct a one-tailed t-test at a 5% level of significance to ascertain if method B results in a significantly higher average test score than method A.',
    given: 'Method B (Sample 1): x̄₁ = 78, s₁ = 7, n₁ = 35; Method A (Sample 2): x̄₂ = 75, s₂ = 8, n₂ = 30, α = 0.05, Right-tailed (>), df = 63',
    steps: [
      ['Step 1 · Null Hypothesis', 'H₀: μ_B ≤ μ_A (Method B average score is less than or equal to Method A)'],
      ['Step 2 · Alternative Hypothesis', 'H₁: μ_B > μ_A (Method B leads to a higher average score than Method A)'],
      ['Step 3 · Significance Level', 'α = 0.05'],
      ['Step 4 · Sample Data', 'Sample 1 (Method B): x̄₁ = 78, s₁ = 7, n₁ = 35. Sample 2 (Method A): x̄₂ = 75, s₂ = 8, n₂ = 30. df = 35 + 30 − 2 = 63.'],
      ['Step 5 · Test Statistic', 'SE = √(7²/35 + 8²/30) = √(49/35 + 64/30) = √(1.40 + 2.133) = √3.533 ≈ 1.8797. t = (78 − 75) / 1.8797 = 3 / 1.8797 = 1.5960'],
      ['Step 6 · Critical Values', 'Right-tailed t-test with df = 63 at α = 0.05: critical value is t_crit = +1.6694. Rejection region: t > 1.6694'],
      ['Step 7 · Conclusion', 't = 1.596 does not exceed the critical threshold of 1.6694 (1.596 < 1.6694). p-value = 0.0577 > 0.05. Fail to reject H₀. At the 5% level of significance, there is not quite sufficient evidence to claim Method B yields a significantly higher mean than Method A.'],
    ],
    verdict: 'Fail to reject H₀',
    dist: 't', mode: 'two', tail: 'right', xbar1: '78', sd1: '7', n1: '35', xbar2: '75', sd2: '8', n2: '30', claim: 'Method B scores higher than Method A', alpha: '0.05',
  },
];

export default function Lessons({
  activeTab = 'regression',
  onNavigate,
  onLaunchRegression,
  onLaunchZTest,
}) {
  const [tab, setTab] = useState(activeTab);
  const [expandedReg, setExpandedReg] = useState('study-hours');
  const [expandedHyp, setExpandedHyp] = useState('s11');

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h1 className="pix" style={{ margin: '8px 0 16px' }}>Statistical Learning Modules</h1>
        {onNavigate && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn sm ghost" onClick={() => onNavigate('about')}>
              How to Use Guide
            </button>
            <button className="btn sm" onClick={() => onNavigate('regression')}>
              Regression Calculator
            </button>
            <button className="btn sm" onClick={() => onNavigate('ztest')}>
              Hypothesis Test Solver
            </button>
          </div>
        )}
      </div>

      <p className="lead">
        Comprehensive instructional modules with formulas, assumptions, limitations, glossaries,
        and the actual course textbook word problems with step-by-step solutions.
      </p>

      {/* Module Navigation Tabs */}
      <div className="sq-module-tabs" style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          className={`btn ${tab === 'regression' ? '' : 'ghost'}`}
          onClick={() => setTab('regression')}
          style={{ margin: 0 }}
        >
          📘 Module 1: Simple Linear Regression
        </button>
        <button
          className={`btn ${tab === 'hypothesis' ? '' : 'ghost'}`}
          onClick={() => setTab('hypothesis')}
          style={{ margin: 0 }}
        >
          📙 Module 2: Hypothesis Testing (Z &amp; t Tests)
        </button>
      </div>

      {/* ========================================================= */}
      {/* MODULE 1: SIMPLE LINEAR REGRESSION                       */}
      {/* ========================================================= */}
      {tab === 'regression' && (
        <>
          {/* Section 1: Theory & Concept */}
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <h2>1. Concepts &amp; Principles</h2>
              {onLaunchRegression && (
                <button className="btn sm" onClick={() => onLaunchRegression()}>
                  Open Regression Tool ↗
                </button>
              )}
            </div>
            <p>
              <b>Simple Linear Regression</b> models the relationship between two continuous variables:
              an <b>independent variable (X)</b> (also known as the predictor or explanatory variable)
              and a <b>dependent variable (Y)</b> (the response or outcome variable being predicted).
            </p>
            <p>
              The model produces the line of best fit using the <i>Ordinary Least Squares (OLS)</i> principle,
              which minimizes the sum of squared vertical residuals:
            </p>
            <div className="big" style={{ textAlign: 'center', margin: '14px 0' }}>
              Ŷ = a + bX
            </div>
            <ul>
              <li><b>b (Slope):</b> The expected change in Y for each one-unit increase in X.</li>
              <li><b>a (Y-intercept):</b> The predicted value of Y when X is equal to 0.</li>
              <li><b>Pearson r:</b> Measures linear correlation strength and direction (−1 ≤ r ≤ +1).</li>
              <li><b>R² (Coefficient of Determination):</b> The share of variance in Y explained by X.</li>
            </ul>
          </section>

          {/* Section 2: Mathematical Formulas */}
          <section className="card">
            <h2>2. Mathematical Formulas</h2>
            <div className="formula-grid">
              <Formula
                title="Slope (b)"
                math={String.raw`b=\frac{\sum_{i=1}^{n}(x_i-\bar{x})(y_i-\bar{y})}{\sum_{i=1}^{n}(x_i-\bar{x})^2}`}
                description="The least-squares slope is the change in predicted Y for a one-unit increase in X."
              />
              <Formula
                title="Y-Intercept (a)"
                math={String.raw`a=\bar{y}-b\bar{x}`}
                description="The fitted value of Y when X is zero."
              />
              <Formula
                title="Pearson Correlation (r)"
                math={String.raw`r=\frac{\sum_{i=1}^{n}(x_i-\bar{x})(y_i-\bar{y})}{\sqrt{\left[\sum_{i=1}^{n}(x_i-\bar{x})^2\right]\left[\sum_{i=1}^{n}(y_i-\bar{y})^2\right]}}`}
                description="Measures the direction and strength of the linear association."
              />
              <Formula
                title="Coefficient of Determination (R²)"
                math={String.raw`R^2=1-\frac{SSE}{SST}=r^2`}
                description="In simple linear regression with an intercept, R² equals r²."
                variables={[
                  [String.raw`SST=\sum_{i=1}^{n}(y_i-\bar{y})^2`, 'Total sum of squares.'],
                  [String.raw`SSE=\sum_{i=1}^{n}(y_i-\hat{y}_i)^2`, 'Error sum of squares.'],
                  [String.raw`SSR=\sum_{i=1}^{n}(\hat{y}_i-\bar{y})^2`, 'Regression sum of squares.'],
                ]}
              />
            </div>
          </section>

          {/* Section 3: Assumptions & Limitations */}
          <section className="card">
            <h2>3. Assumptions &amp; Limitations</h2>
            <ul>
              <li><b>Linearity:</b> Assumes the true underlying relationship between X and Y is straight-line linear. Always check the scatter plot for curvilinear patterns.</li>
              <li><b>Sensitivity to Outliers:</b> Outliers can drastically tilt the regression slope and inflate or deflate Pearson <code>r</code>.</li>
              <li><b>Correlation ≠ Causation:</b> A high correlation coefficient (<code>r ≈ 1</code> or <code>r ≈ −1</code>) indicates that two variables move together, not that X causes Y.</li>
              <li>
                <b>Interpretation Thresholds for |r|:</b>
                <ul>
                  <li><code>|r| &lt; 0.20</code>: Very weak linear relationship</li>
                  <li><code>0.20 ≤ |r| &lt; 0.40</code>: Weak linear relationship</li>
                  <li><code>0.40 ≤ |r| &lt; 0.60</code>: Moderate linear relationship</li>
                  <li><code>0.60 ≤ |r| &lt; 0.80</code>: Strong linear relationship</li>
                  <li><code>|r| ≥ 0.80</code>: Very strong linear relationship</li>
                </ul>
              </li>
              <li><b>Extrapolation Risk:</b> Making predictions for values of X far outside the observed range of the sample data is unreliable.</li>
            </ul>
          </section>

          {/* Section 4: Glossary */}
          <section className="card">
            <h2>4. Regression Glossary</h2>
            <dl>
              {REGRESSION_GLOSSARY.map(([t, d]) => (
                <div key={t} style={{ marginBottom: 10 }}>
                  <dt>{t}</dt>
                  <dd>{d}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Section 5: Actual Given Word Problems */}
          <section className="card">
            <h2>5. Actual Given Word Problems (Linear Regression)</h2>
            <p>
              These are the actual textbook and class problems. Click any problem to inspect its full
              step-by-step algebraic solution, or load it directly into the calculator:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {REGRESSION_PROBLEMS.map((prob) => {
                const isOpen = expandedReg === prob.id;
                return (
                  <div
                    key={prob.id}
                    style={{
                      background: 'rgba(124, 77, 255, 0.12)',
                      border: '2px solid #5B3CD6',
                      borderRadius: 14,
                      padding: 16,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <h3 style={{ margin: 0, color: '#FFE9A8' }}>{prob.title}</h3>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {onLaunchRegression && (
                          <button
                            className="btn sm"
                            onClick={() => onLaunchRegression(prob)}
                          >
                            Open in Calculator ↗
                          </button>
                        )}
                        <button
                          className="btn sm ghost"
                          onClick={() => setExpandedReg(isOpen ? null : prob.id)}
                        >
                          {isOpen ? 'Collapse ▲' : 'Show Solution ▼'}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: 10, background: '#110B29', padding: 12, borderRadius: 8, border: '1px solid #3F2B85' }}>
                      <b>Problem Statement:</b>
                      <p style={{ margin: '6px 0 0', color: '#EDE8FF' }}>{prob.problem}</p>
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                      <span className="badge on">X: {prob.xName}</span>
                      <span className="badge on">Y: {prob.yName}</span>
                      <span className="badge">n = {prob.stats.n} pairs</span>
                    </div>

                    {isOpen && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed rgba(185, 162, 255, 0.3)' }}>
                        <div className="stats">
                          <div><small>Fitted Line</small><b>{prob.stats.b}X</b></div>
                          <div><small>Slope (b)</small><b>{prob.stats.b}</b></div>
                          <div><small>Intercept (a)</small><b>{prob.stats.a}</b></div>
                          <div><small>r</small><b>{prob.stats.r}</b></div>
                          <div><small>R²</small><b>{prob.stats.r2.split(' ')[0]}</b></div>
                        </div>

                        <p className="big" style={{ fontSize: '1.1rem' }}>{prob.stats.eq}</p>
                        <p><b>Correlation assessment:</b> {prob.stats.rStrength}.</p>
                        <p><b>Explained variance:</b> {prob.stats.r2}.</p>

                        <h4>Step-by-step derivation:</h4>
                        <ol className="steps">
                          {prob.steps.map((st, idx) => (
                            <li key={idx}>{st}</li>
                          ))}
                        </ol>

                        <div style={{ marginTop: 10 }}>
                          <b>Data Pairs (X, Y):</b>{' '}
                          <code>{prob.pairs.map(([x, y]) => `(${x}, ${y})`).join(', ')}</code>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* ========================================================= */}
      {/* MODULE 2: HYPOTHESIS TESTING (Z & T TESTS)               */}
      {/* ========================================================= */}
      {tab === 'hypothesis' && (
        <>
          {/* Section 1: 7-Step Method & Overview */}
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <h2>1. The 7-Step Hypothesis Testing Framework</h2>
              {onLaunchZTest && (
                <button className="btn sm" onClick={() => onLaunchZTest()}>
                  Open Hypothesis Tool ↗
                </button>
              )}
            </div>
            <p>
              Hypothesis testing is a systematic statistical procedure to determine whether sample evidence
              warrants rejecting a null hypothesis claim about a population parameter:
            </p>
            <ol className="steps">
              <li>
                <b>Step 1: State the null hypothesis (H₀)</b>
                <br />
                The baseline claim of "no difference / no effect". Always written with an equality sign:
                <code> H₀: μ = μ₀</code> (one-sample) or <code>H₀: μ₁ = μ₂</code> (two-sample).
              </li>
              <li>
                <b>Step 2: State the alternative hypothesis (H₁)</b>
                <br />
                The research claim supported when H₀ is rejected:
                <ul>
                  <li><b>Two-tailed (≠):</b> Looking for any significant difference in either direction.</li>
                  <li><b>Left-tailed (&lt;):</b> Testing if the parameter is significantly smaller / less.</li>
                  <li><b>Right-tailed (&gt;):</b> Testing if the parameter is significantly larger / greater.</li>
                </ul>
              </li>
              <li>
                <b>Step 3: Set the significance level (α)</b>
                <br />
                The risk threshold for Type I error, typically <code>α = 0.05</code> (5%), <code>0.01</code> (1%), or <code>0.10</code> (10%).
                The corresponding confidence level is <code>1 − α</code> (e.g. 95%).
              </li>
              <li>
                <b>Step 4: Collect sample data</b>
                <br />
                Gather the sample size (<code>n</code>), sample mean (<code>x̄</code>), and population standard deviation (<code>σ</code>) or sample standard deviation (<code>s</code>).
              </li>
              <li>
                <b>Step 5: Calculate the test statistic (Z or t)</b>
                <br />
                Quantifies how many standard errors the observed sample mean lies away from the null value.
              </li>
              <li>
                <b>Step 6: Construct rejection and acceptance regions</b>
                <br />
                Find the critical cutoff value(s) from the standard normal (Z) or Student's t distribution table for the given α and tail.
              </li>
              <li>
                <b>Step 7: Draw a statistical conclusion &amp; interpret</b>
                <br />
                If the test statistic falls in the rejection region (equivalently, <code>p-value ≤ α</code>),
                <b> Reject H₀</b>. Otherwise, <b>Fail to reject H₀</b>. State the conclusion in plain language related to the original problem.
              </li>
            </ol>
          </section>

          {/* Section 2: Z-Test vs. t-Test Decision Table */}
          <section className="card">
            <h2>2. Choosing Between Z-Test and t-Test</h2>
            <div className="tbl">
              <table>
                <thead>
                  <tr>
                    <th>Criteria</th>
                    <th>Z-Test (Normal Distribution)</th>
                    <th>t-Test (Student's t Distribution)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Population SD (σ)</b></td>
                    <td>Known (given in the problem)</td>
                    <td>Unknown (estimated using sample SD <i>s</i>)</td>
                  </tr>
                  <tr>
                    <td><b>Sample Size (n)</b></td>
                    <td>Large samples (<code>n ≥ 30</code>)</td>
                    <td>Can be used for any size, crucial when <code>n &lt; 30</code></td>
                  </tr>
                  <tr>
                    <td><b>Distribution Shape</b></td>
                    <td>Standard Normal Curve (Z ~ N(0, 1))</td>
                    <td>Heavier tails depending on degrees of freedom (df)</td>
                  </tr>
                  <tr>
                    <td><b>Degrees of Freedom</b></td>
                    <td>Not applicable</td>
                    <td>One-sample: <code>df = n − 1</code>; Two-sample: <code>df = n₁ + n₂ − 2</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 3: Formulas */}
          <section className="card">
            <h2>3. Hypothesis Testing Formulas</h2>
            <div className="formula-grid">
              <Formula
                title="One-sample Z-test"
                math={String.raw`z=\frac{\bar{x}-\mu_0}{\sigma/\sqrt{n}}`}
                description="Uses the known population standard deviation σ."
              />
              <Formula
                title="Two-sample Z-test"
                className="formula-two-sample"
                math={String.raw`z = \dfrac{(\bar{x}_1 - \bar{x}_2) - D_0}{\sqrt{\dfrac{\sigma_1^2}{n_1} + \dfrac{\sigma_2^2}{n_2}}}`}
                description="D₀ is the hypothesized difference between population means."
                variables={[
                  [String.raw`\bar{x}_1, \bar{x}_2`, 'Sample means for group 1 and group 2.'],
                  [String.raw`D_0`, 'Hypothesized difference between population means (often 0).'],
                  [String.raw`\sigma_1^2, \sigma_2^2`, 'Known population variances for group 1 and group 2.'],
                  [String.raw`n_1, n_2`, 'Sample sizes for group 1 and group 2.'],
                ]}
              />
              <Formula
                title="One-sample t-test"
                math={String.raw`t=\frac{\bar{x}-\mu_0}{s/\sqrt{n}},\qquad df=n-1`}
                description="Uses the sample standard deviation s."
              />
              <Formula
                title="Two-sample t-test"
                className="formula-two-sample"
                math={String.raw`t = \dfrac{(\bar{x}_1 - \bar{x}_2) - D_0}{\sqrt{\dfrac{s_1^2}{n_1} + \dfrac{s_2^2}{n_2}}}`}
                description="The displayed standard error matches the calculator’s two-sample t statistic."
                variables={[
                  [String.raw`\bar{x}_1, \bar{x}_2`, 'Sample means for group 1 and group 2.'],
                  [String.raw`D_0`, 'Hypothesized difference between population means (often 0).'],
                  [String.raw`s_1^2, s_2^2`, 'Sample variances for group 1 and group 2.'],
                  [String.raw`n_1, n_2`, 'Sample sizes for group 1 and group 2.'],
                ]}
              />
              <Formula
                title="Classic two-sample degrees of freedom"
                math={String.raw`df=n_1+n_2-2`}
                description="The calculator also offers Welch–Satterthwaite degrees of freedom for unequal variances."
              />
              <Formula
                title="Welch–Satterthwaite degrees of freedom"
                className="formula-card-wide formula-welch"
                math={String.raw`df = \dfrac{\left(\dfrac{s_1^2}{n_1} + \dfrac{s_2^2}{n_2}\right)^2}{\dfrac{\left(\dfrac{s_1^2}{n_1}\right)^2}{n_1 - 1} + \dfrac{\left(\dfrac{s_2^2}{n_2}\right)^2}{n_2 - 1}}`}
                description="Effective degrees of freedom for two-sample t-tests when population variances are assumed unequal."
                variables={[
                  [String.raw`s_1^2, s_2^2`, 'Sample variances for group 1 and group 2.'],
                  [String.raw`n_1, n_2`, 'Sample sizes for group 1 and group 2.'],
                ]}
              />
              <Formula
                title="P-value rules"
                math={String.raw`\begin{aligned}
                  \text{Left-tailed: }&p=\Phi(z)\ \text{or }P(T\le t)\\
                  \text{Right-tailed: }&p=1-\Phi(z)\ \text{or }P(T\ge t)\\
                  \text{Two-tailed: }&p=2[1-\Phi(|z|)]\ \text{or }2P(T\ge|t|)
                \end{aligned}`}
              />
            </div>
          </section>

          {/* Section 4: Assumptions & Limitations */}
          <section className="card">
            <h2>4. Assumptions &amp; Limitations</h2>
            <ul>
              <li><b>Random Sampling:</b> Samples must be randomly selected and independent of one another.</li>
              <li><b>Normality:</b> The population should be approximately normal, especially when sample size is small (<code>n &lt; 30</code>). For large samples (<code>n ≥ 30</code>), the Central Limit Theorem assures normality of the sample mean.</li>
              <li><b>Terminology:</b> We state <b>"Fail to reject H₀"</b>, NEVER <i>"Accept H₀"</i>. Absence of evidence against H₀ is not proof that H₀ is definitively true.</li>
              <li><b>Significance vs. Practical Importance:</b> A statistically significant difference (p ≤ α) may still have negligible real-world importance if the sample size is enormous.</li>
            </ul>
          </section>

          {/* Section 5: Glossary */}
          <section className="card">
            <h2>5. Hypothesis Testing Glossary</h2>
            <dl>
              {HYPOTHESIS_GLOSSARY.map(([t, d]) => (
                <div key={t} style={{ marginBottom: 10 }}>
                  <dt>{t}</dt>
                  <dd>{d}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Section 6: Actual Given Word Problems */}
          <section className="card">
            <h2>6. Actual Given Word Problems (Module 9 Slides)</h2>
            <p>
              These are the 8 actual word problems from the Module 9 curriculum slides.
              Each problem includes the given values, hypotheses, test statistic, critical threshold,
              and final conclusion. Click <b>Show Solution</b> to expand or <b>Solve in Calculator</b> to load it directly:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {HYPOTHESIS_PROBLEMS.map((prob) => {
                const isOpen = expandedHyp === prob.id;
                return (
                  <div
                    key={prob.id}
                    style={{
                      background: 'rgba(124, 77, 255, 0.12)',
                      border: '2px solid #5B3CD6',
                      borderRadius: 14,
                      padding: 16,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <span className="badge on" style={{ marginRight: 8 }}>{prob.slide}</span>
                        <h3 style={{ display: 'inline', margin: 0, color: '#FFE9A8' }}>{prob.title}</h3>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className={`verdict ${prob.verdict === 'Reject H₀' ? 'rej' : 'ftr'}`} style={{ fontSize: '0.82rem', padding: '4px 10px' }}>
                          {prob.verdict}
                        </span>
                        {onLaunchZTest && (
                          <button
                            className="btn sm"
                            onClick={() => onLaunchZTest(prob)}
                          >
                            Solve in Calculator ↗
                          </button>
                        )}
                        <button
                          className="btn sm ghost"
                          onClick={() => setExpandedHyp(isOpen ? null : prob.id)}
                        >
                          {isOpen ? 'Collapse ▲' : 'Show Solution ▼'}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: 10, background: '#110B29', padding: 12, borderRadius: 8, border: '1px solid #3F2B85' }}>
                      <b>Problem Statement:</b>
                      <p style={{ margin: '6px 0 0', color: '#EDE8FF', whiteSpace: 'pre-line' }}>{prob.problem}</p>
                    </div>

                    <div style={{ marginTop: 10, fontSize: '0.88rem', color: '#B9A2FF' }}>
                      <b>Given Parameters:</b> {prob.given}
                    </div>

                    {isOpen && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed rgba(185, 162, 255, 0.3)' }}>
                        <h4>Full 7-Step Solution:</h4>
                        <ol className="steps">
                          {prob.steps.map(([stTitle, stDesc]) => (
                            <li key={stTitle}>
                              <b>{stTitle}</b>
                              <br />
                              {stDesc}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </>
  );
}
