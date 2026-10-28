import { parseProblem } from './parser.js';
import { hypTest } from './stats.js';
let bad = 0;
const P = {
 s11: 'A traveler claims that the average weight of his luggage is 40  kilos with an standard deviation of 9.5 kilos. Would you agree to this claim if a random sample of 50 luggage showed an average weight of 38 kilos using 0.05 level of significance. ',
 s12: "A manufacturer claims that the mean weight of their cereal boxes is 500 grams. To test this claim, a random sample of 36 cereal boxes is selected, and their weights are recorded. The sample mean weight is found to be 495 grams with a known population standard deviation of 10 grams. At a 5% level of significance, can you conclude that the mean weight of the cereal boxes is different from the manufacturer's claim?",
 s13: "A school district claims that the average score of its students in a standardized test is higher than 75. To test this claim, a random sample of 100 students is taken, and their average score is found to be 78 with a known population standard deviation of 8. Conduct a one-tailed z-test at a 5% level of significance to determine if there is enough evidence to support the district's claim.",
 s15: 'Fifty full time students were given an examination in Statistics and got an average grade of 95 with a variance of 10.5 while 50 working students have an average grade of 88 with a variance of 8.5. Is there a significant difference in the mean grade of the two groups at 0.05 level of significance?',
 s18: 'A firm produces light bulbs hving an average life span of 725 hours and with a standard deviation of 40 hours. If a random sample of 20 bulbs has an average life span of 700 hours, test the hypothesis that the life span of the lightbulbs is less than 725 hours.',
 s19: "A coffee shop claims that the average waiting time for customers' orders is less than 4 minutes. To test this claim, a random sample of 25 orders is taken, and their waiting times are recorded. The sample mean waiting time is found to be 3.6 minutes with a sample standard deviation of 0.8 minutes. Conduct a one-tailed t-test at a 5% level of significance to determine if there is enough evidence to support the coffee shop's claim.",
 s21: 'Two samples are taken from two groups of students. Group 1 comes from public school and group 2 comes from private school. They were given examination in Chemistry subject and the results are shows in below.\n\nGroup 1: n=10, X1bar = 86, s1^2 = 48\nGroup 2: n=12, X1bar = 88, s1^2 = 38',
 s22: 'An educational institute is implementing two teaching methods, A and B, for improving student performance in mathematics. They want to determine if method B leads to a higher average test score than method A. A sample of 30 students taught with method A has a mean test score of 75 with a standard deviation of 8. Another sample of 35 students taught with method B has a mean test score of 78 with a standard deviation of 7. Conduct a one-tailed t-test at a 5% level of significance to ascertain if method B results in a significantly higher average test score than method A.',
 v1: 'A researcher claims the mean height of adult males is at least 170 cm. A sample of 40 males has a mean height of 168 cm with σ = 6 cm. Test at α = 0.01.',
 v2: 'The average commute time is 30 minutes. A random sample of 16 commuters showed a mean of 33 minutes and a sample standard deviation of 5 minutes. Is the commute time longer than 30 minutes? Use a 10% level of significance.',
 v3: 'Group 1: n = 40, x̄ = 52, σ = 5. Group 2: n = 45, x̄ = 50, σ = 6. Test whether there is a difference between the group means at the 0.05 level of significance.',
 v4: 'A machine fills bottles with mean 500 ml. A sample of 9 bottles has mean 497 ml and s = 4 ml. Test at α = 0.05 whether the true mean differs from 500.',
};
// expected: [dist, mode, tail, alpha, key values]
const E = {
 s11: ['z','one','two','0.05',{m0:'40',xbar:'38',sd:'9.5',n:'50'}],
 s12: ['z','one','two','0.05',{m0:'500',xbar:'495',sd:'10',n:'36'}],
 s13: ['z','one','right','0.05',{m0:'75',xbar:'78',sd:'8',n:'100'}],
 s15: ['z','two','two','0.05',{xbar1:'95',sd1:'10.5',n1:'50',xbar2:'88',sd2:'8.5',n2:'50',spread:'var'}],
 s18: ['t','one','left','0.05',{m0:'725',xbar:'700',sd:'40',n:'20'}],
 s19: ['t','one','left','0.05',{m0:'4',xbar:'3.6',sd:'0.8',n:'25'}],
 s21: ['t','two','two','0.05',{xbar1:'86',sd1:'48',n1:'10',xbar2:'88',sd2:'38',n2:'12',spread:'var'}],
 s22: ['t','two','left','0.05',{xbar1:'75',sd1:'8',n1:'30',xbar2:'78',sd2:'7',n2:'35'}],
 v1: ['z','one','left','0.01',{m0:'170',xbar:'168',sd:'6',n:'40'}],
 v2: ['t','one','right','0.10',{m0:'30',xbar:'33',sd:'5',n:'16'}],
 v3: ['z','two','two','0.05',{xbar1:'52',sd1:'5',n1:'40',xbar2:'50',sd2:'6',n2:'45'}],
 v4: ['t','one','two','0.05',{m0:'500',xbar:'497',sd:'4',n:'9'}],
};
for (const k of Object.keys(P)) {
  const r = parseProblem(P[k]);
  const [d, m, t, a, vals] = E[k];
  const f = r.fields || {};
  const wrong = [];
  if (f.dist !== d) wrong.push(`dist ${f.dist}≠${d}`);
  if (f.mode !== m) wrong.push(`mode ${f.mode}≠${m}`);
  if (f.tail !== t) wrong.push(`tail ${f.tail}≠${t}`);
  if (f.alpha !== a) wrong.push(`alpha ${f.alpha}≠${a}`);
  for (const [kk, v] of Object.entries(vals)) if (f[kk] !== v) wrong.push(`${kk} ${f[kk]}≠${v}`);
  if (r.missing && r.missing.length) wrong.push('missing ' + r.missing.join(','));
  if (!wrong.length) { const res = hypTest({ ...f }); if (res.error) wrong.push('hypTest: ' + res.error); }
  if (wrong.length) bad++;
  console.log(wrong.length ? 'FAIL' : 'PASS', k, wrong.join('; '));
}
console.log(bad ? `\n${bad} FAILED` : '\nAll parser tests passed');
process.exit(bad ? 1 : 0);