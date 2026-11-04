import assert from 'node:assert/strict';
import test from 'node:test';
import katex from 'katex';

const formulas = [
  String.raw`b=\frac{\sum_{i=1}^{n}(x_i-\bar{x})(y_i-\bar{y})}{\sum_{i=1}^{n}(x_i-\bar{x})^2}`,
  String.raw`a=\bar{y}-b\bar{x}`,
  String.raw`r=\frac{\sum_{i=1}^{n}(x_i-\bar{x})(y_i-\bar{y})}{\sqrt{\left[\sum_{i=1}^{n}(x_i-\bar{x})^2\right]\left[\sum_{i=1}^{n}(y_i-\bar{y})^2\right]}}`,
  String.raw`R^2=1-\frac{SSE}{SST}=r^2`,
  String.raw`z=\frac{\bar{x}-\mu_0}{\sigma/\sqrt{n}}`,
  String.raw`t=\frac{(\bar{x}_1-\bar{x}_2)-D_0}{\sqrt{\frac{s_1^2}{n_1}+\frac{s_2^2}{n_2}}}`,
  String.raw`z = \dfrac{(\bar{x}_1 - \bar{x}_2) - D_0}{\sqrt{\dfrac{\sigma_1^2}{n_1} + \dfrac{\sigma_2^2}{n_2}}}`,
  String.raw`t = \dfrac{(\bar{x}_1 - \bar{x}_2) - D_0}{\sqrt{\dfrac{s_1^2}{n_1} + \dfrac{s_2^2}{n_2}}}`,
  String.raw`df = \dfrac{\left(\dfrac{s_1^2}{n_1} + \dfrac{s_2^2}{n_2}\right)^2}{\dfrac{\left(\dfrac{s_1^2}{n_1}\right)^2}{n_1 - 1} + \dfrac{\left(\dfrac{s_2^2}{n_2}\right)^2}{n_2 - 1}}`,
  String.raw`\begin{aligned}\text{Left-tailed: }&p=\Phi(z)\ \text{or }P(T\le t)\\\text{Right-tailed: }&p=1-\Phi(z)\ \text{or }P(T\ge t)\end{aligned}`,
  String.raw`\begin{bmatrix}a&b\\c&d\end{bmatrix}`,
];

test('KaTeX renders regression, inference, Greek, and matrix notation', () => {
  for (const math of formulas) {
    const html = katex.renderToString(math, { throwOnError: true });
    assert.match(html, /katex/);
  }
});
