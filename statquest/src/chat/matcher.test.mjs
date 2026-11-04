import assert from 'node:assert/strict';
import test from 'node:test';
import { matchQuestion, normalizeQuestion } from './matcher.js';

test('normalizes casing, whitespace, punctuation, and statistical symbols', () => {
  assert.equal(normalizeQuestion('  What is R²?  '), 'what is r2');
  assert.equal(normalizeQuestion('ALPHA = 0.05!'), 'alpha 0 05');
});

test('matches exact supported questions and handles unsupported supported-statistics topics', () => {
  assert.equal(matchQuestion('What is a p-value?').entry.id, 'p-value');
  assert.equal(matchQuestion('What is a confidence interval?').type, 'fallback');
});

test('matches synonyms and a common one-character misspelling', () => {
  assert.equal(matchQuestion('How strongly do variables move together?').entry.id, 'correlation');
  assert.equal(matchQuestion('What does pearson corelation measure?').entry.id, 'correlation');
});

test('clarifies broad topics and rejects unrelated questions', () => {
  assert.equal(matchQuestion('Tell me about regression').type, 'clarification');
  assert.equal(matchQuestion('How do I bake sourdough?').type, 'out-of-scope');
});

test('does not perform requested calculations and validates empty input', () => {
  assert.equal(matchQuestion('Calculate the z statistic for mean 12 and standard deviation 3').type, 'calculation');
  assert.equal(matchQuestion('  ').type, 'empty');
});