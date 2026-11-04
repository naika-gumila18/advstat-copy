import {
  AMBIGUOUS_TOPICS,
  CALCULATION_RESPONSE,
  FALLBACK_RESPONSE,
  KNOWLEDGE_BASE,
  OUT_OF_SCOPE_RESPONSE,
  SUPPORTED_TERMS,
} from './knowledgeBase.js';

const STOP_WORDS = new Set([
  'about', 'and', 'are', 'can', 'do', 'does', 'for', 'how', 'i', 'in', 'is',
  'it', 'mean', 'of', 'or', 'the', 'to', 'use', 'what', 'when', 'which',
  'with', 'would', 'you', 'your',
]);

export function normalizeQuestion(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[₀]/g, '0')
    .replace(/[₁]/g, '1')
    .replace(/[²]/g, '2')
    .replace(/α/g, 'alpha')
    .replace(/β/g, 'beta')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function termInText(text, term) {
  const normalizedTerm = normalizeQuestion(term);
  return normalizedTerm && ` ${text} `.includes(` ${normalizedTerm} `);
}

function tokenize(text) {
  return text.split(' ').filter((word) => word && !STOP_WORDS.has(word));
}

function editDistanceAtMostOne(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (a.length > b.length) i += 1;
    else if (b.length > a.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  if (i < a.length || j < b.length) edits += 1;
  return edits <= 1;
}

function isOneEditApart(a, b) {
  return a !== b && editDistanceAtMostOne(a, b);
}

function keywordTypoHit(words, keyword) {
  const term = normalizeQuestion(keyword);
  return !term.includes(' ') && term.length >= 5 && [...words].some(
    (word) => word.length >= 5 && isOneEditApart(term, word),
  );
}

function rankEntries(scoreEntry) {
  const ranked = KNOWLEDGE_BASE
    .map((entry) => ({ entry, score: scoreEntry(entry) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  if (!ranked.length) return null;
  const [best, second] = ranked;
  if (second && best.score - second.score <= 1) {
    return {
      type: 'clarification',
      response: `Are you asking about ${best.entry.title.toLowerCase()} or ${second.entry.title.toLowerCase()}?`,
    };
  }
  return { type: 'answer', entry: best.entry, response: best.entry.answer };
}

function hasSupportedContext(text) {
  const words = tokenize(text);
  return SUPPORTED_TERMS.some((term) => {
    const normalized = normalizeQuestion(term);
    return normalized.includes(' ')
      ? termInText(text, normalized)
      : words.includes(normalized);
  });
}

function asksForCalculation(text) {
  return /\b(?:calculate|compute|solve|work out|run)\b/.test(text)
    && /\b\d+(?:\.\d+)?\b/.test(text);
}

export function matchQuestion(input) {
  const text = normalizeQuestion(input);
  if (!text) {
    return { type: 'empty', response: 'Please enter a question about a supported statistics topic.' };
  }

  if (asksForCalculation(text) && hasSupportedContext(text)) {
    return { type: 'calculation', response: CALCULATION_RESPONSE };
  }

  const exact = KNOWLEDGE_BASE.find((entry) =>
    entry.questions.some((question) => normalizeQuestion(question) === text),
  );
  if (exact) return { type: 'answer', entry: exact, response: exact.answer };

  const phraseMatch = rankEntries((entry) =>
    entry.phrases.reduce(
      (score, phrase) => score + (termInText(text, phrase) ? 2 + normalizeQuestion(phrase).split(' ').length : 0),
      0,
    ),
  );
  if (phraseMatch) return phraseMatch;

  const words = new Set(tokenize(text));
  const keywordMatch = rankEntries((entry) => {
    const exactHits = entry.keywords.filter((keyword) => {
      const normalized = normalizeQuestion(keyword);
      return normalized.includes(' ') ? termInText(text, normalized) : words.has(normalized);
    });
    const typoHits = entry.keywords.filter((keyword) => keywordTypoHit(words, keyword));
    const hits = exactHits.length + Math.min(typoHits.length, 1);
    return hits >= 2 ? hits * 2 : 0;
  });
  if (keywordMatch) return keywordMatch;

  const synonymMatch = rankEntries((entry) => entry.synonyms.reduce((total, synonym) => {
    const normalized = normalizeQuestion(synonym);
    if (termInText(text, normalized)) return total + normalized.split(' ').length + 1;
    const tokens = tokenize(normalized);
    const exactHits = tokens.filter((word) => words.has(word)).length;
    const typoHits = tokens.filter((word) =>
      word.length >= 5 && [...words].some((queryWord) => isOneEditApart(word, queryWord)),
    ).length;
    const hits = exactHits + Math.min(typoHits, 1);
    return total + (hits >= 2 ? hits + 2 : 0);
  }, 0));
  if (synonymMatch) return synonymMatch;

  const ambiguous = AMBIGUOUS_TOPICS.find(({ pattern }) => pattern.test(text));
  if (ambiguous) return { type: 'clarification', response: ambiguous.response };
  if (!hasSupportedContext(text)) return { type: 'out-of-scope', response: OUT_OF_SCOPE_RESPONSE };
  return { type: 'fallback', response: FALLBACK_RESPONSE };
}