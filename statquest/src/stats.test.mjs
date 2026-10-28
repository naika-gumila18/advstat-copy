import { regression, hypTest, normInv, normCdf, tInv, tCdf } from './stats.js';
let bad = 0;
const close = (a, b, t = 1e-3) => Math.abs(a - b) < t;
const ok = (name, c) => { if (!c) bad++; console.log(c ? 'PASS' : 'FAIL', name); };

// Regression
const r = regression([[1,2],[2,4],[3,5],[4,4],[5,5]].map(([x, y]) => ({ x, y })));
ok('regression slope 0.6', close(r.b, 0.6, 1e-9));
ok('regression intercept 2.2', close(r.a, 2.2, 1e-9));
ok('regression r 0.7746', close(r.r, 0.7746, 1e-4));
ok('regression R² 0.6', close(r.r2, 0.6, 1e-9));
ok('identical X rejected', !!regression([{x:1,y:1},{x:1,y:2},{x:1,y:3}]).error);

// Distribution tables
ok('z .975 = 1.9600', close(normInv(0.975), 1.959964, 1e-5));
ok('z .95 = 1.6449', close(normInv(0.95), 1.644854, 1e-5));
ok('z .995 = 2.5758', close(normInv(0.995), 2.575829, 1e-5));
ok('t(.95, df19) = 1.7291', close(tInv(0.95, 19), 1.7291, 1e-3));
ok('t(.95, df24) = 1.7109', close(tInv(0.95, 24), 1.7109, 1e-3));
ok('t(.975, df20) = 2.0860', close(tInv(0.975, 20), 2.0860, 1e-3));
ok('t(.95, df63) = 1.6694', close(tInv(0.95, 63), 1.6694, 1e-3));
ok('t(.975, df1) = 12.706', close(tInv(0.975, 1), 12.706, 1e-2));
ok('t cdf(0) = .5', close(tCdf(0, 7), 0.5, 1e-12));

// Class examples (Module 9 slides)
const T = (f) => hypTest({ alpha: 0.05, spread: 'sd', df: 'classic', d0: '0', ...f });
let x = T({ dist: 'z', mode: 'one', tail: 'two', m0: 40, xbar: 38, sd: 9.5, n: 50 });
ok('Slide 11 luggage z = -1.4887, fail to reject', close(x.stat, -1.4887, 1e-3) && !x.reject);
x = T({ dist: 'z', mode: 'one', tail: 'two', m0: 500, xbar: 495, sd: 10, n: 36 });
ok('Slide 12 cereal z = -3, reject', close(x.stat, -3, 1e-9) && x.reject);
x = T({ dist: 'z', mode: 'one', tail: 'right', m0: 75, xbar: 78, sd: 8, n: 100 });
ok('Slide 13 school z = 3.75, reject', close(x.stat, 3.75, 1e-9) && x.reject);
x = T({ dist: 'z', mode: 'two', tail: 'two', spread: 'var', xbar1: 95, sd1: 10.5, n1: 50, xbar2: 88, sd2: 8.5, n2: 50 });
ok('Slide 15 z = 11.356, reject', close(x.stat, 11.356, 1e-2) && x.reject);
x = T({ dist: 't', mode: 'one', tail: 'left', m0: 725, xbar: 700, sd: 40, n: 20 });
ok('Slide 18 bulbs t = -2.7951 df19 crit -1.7291, reject', close(x.stat, -2.7951, 1e-3) && x.df === 19 && close(x.crit[0], -1.7291, 1e-3) && x.reject);
x = T({ dist: 't', mode: 'one', tail: 'left', m0: 4, xbar: 3.6, sd: 0.8, n: 25 });
ok('Slide 19 coffee t = -2.5 df24 crit -1.7109, reject', close(x.stat, -2.5, 1e-9) && close(x.crit[0], -1.7109, 1e-3) && x.reject);
x = T({ dist: 't', mode: 'two', tail: 'two', spread: 'var', xbar1: 86, sd1: 48, n1: 10, xbar2: 88, sd2: 38, n2: 12 });
ok('Slide 21 t = -0.7086 df20 crit ±2.086, fail to reject', close(x.stat, -0.7086, 1e-3) && x.df === 20 && close(x.crit[1], 2.086, 1e-3) && !x.reject);
x = T({ dist: 't', mode: 'two', tail: 'right', xbar1: 78, sd1: 7, n1: 35, xbar2: 75, sd2: 8, n2: 30 });
ok('Slide 22 t = 1.596 df63, fail to reject', close(x.stat, 1.596, 1e-3) && x.df === 63 && !x.reject);
x = T({ dist: 't', mode: 'two', tail: 'right', df: 'welch', xbar1: 78, sd1: 7, n1: 35, xbar2: 75, sd2: 8, n2: 30 });
ok('Welch df is between 58 and 63', x.df > 58 && x.df < 63);

// Validation
ok('σ = 0 rejected', !!T({ dist: 'z', mode: 'one', tail: 'two', m0: 1, xbar: 2, sd: 0, n: 5 }).error);
ok('blank field rejected', !!T({ dist: 'z', mode: 'one', tail: 'two', m0: '', xbar: 2, sd: 1, n: 5 }).error);
ok('t needs n ≥ 2', !!T({ dist: 't', mode: 'one', tail: 'two', m0: 1, xbar: 2, sd: 1, n: 1 }).error);

console.log(bad ? `\n${bad} FAILED` : '\nAll tests passed');
process.exit(bad ? 1 : 0);