// Finds the independent (X) and dependent (Y) variable in a regression word problem.
// Pattern-based and optional: the user still types the X and Y data themselves.

const STOP = '(?:and|on|upon|from|using|based on|by|with|in|for|when|if|is|are|was|were|will|can|could|does|do|did|has|have|affects?|influences?|impacts?|depends?|increases?|decreases?|changes?|varies|vary|relates?|predicts?|determines?|explains?|at|among|than)';
const END = `(?=\\s+${STOP}\\b|[.,;:?!)]|$)`;
const END2 = '(?=[.,;:?!)]|\\s+(?:and|while|whereas)\\b|$)';
const P = "([a-z][a-z0-9'’ /%-]{1,60}?)";

const INDEP = /\b(hours?|time|age|dose|dosage|amount|price|temperature|advertis\w*|spend\w*|spending|years?|experience|rainfall|fertilizer|speed|study|training|exercise|sleep|practice|number of)\b/;
const DEP = /\b(scores?|grades?|gpa|sales|revenue|profit|weight|yield|income|salary|performance|growth|results?|pressure|rate|level|production|demand|cost)\b/;

function clean(raw) {
  if (!raw) return null;
  let s = raw.toLowerCase().trim();
  const parts = s.split(/\b(?:if|whether|that|know|how|does|do|did|determine|investigate|examine|find out|predict(?:ing)?|estimat(?:e|ing)|forecast(?:ing)?|explain(?:ing)?|model(?:ing)?|between|effects?|impact|influence)\b\s+/);
  s = parts[parts.length - 1];
  let prev;
  do { prev = s; s = s.replace(/^(?:the|a|an|their|his|her|its|each|many|much|some|of|on|in)\s+/, ''); } while (s !== prev);
  s = s.replace(/\s+(?:variable|data)$/, '').trim();
  const w = s.split(/\s+/);
  if (w.length > 6) s = w.slice(-6).join(' ');
  if (!s) return null;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const R = (src) => new RegExp(src);

// [regex, indexOfIndependent, indexOfDependent, explanation]
const RULES = [
  [R(`(?:effects?|impact|influence) of (?:the )?${P}\\s+(?:on|upon)\\s+(?:the )?${P}${END}`), 1, 2, 'The problem asks about the effect of one variable on another. The one that does the affecting is independent (X); the one being affected is dependent (Y).'],
  [R(`(?:predict|estimate|forecast|explain|model|determine)\\s+(?:the )?${P}\\s+(?:from|using|based on|by|given|with|as a function of|according to)\\s+(?:the )?${P}${END}`), 2, 1, 'You are asked to predict one variable from another. The variable being predicted is dependent (Y); the one used to predict it is independent (X).'],
  [R(`regress(?:ion)?\\s+(?:of\\s+)?${P}\\s+(?:on|against|upon)\\s+${P}${END}`), 2, 1, '"Regress Y on X" means Y is the dependent variable and X is the independent variable.'],
  [R(`${P}\\s+(?:depends?|depending)\\s+on\\s+(?:the )?${P}${END}`), 2, 1, 'The variable that "depends on" the other is dependent (Y); the other is independent (X).'],
  [R(`${P}\\s+(?:is|are) (?:affected|influenced|determined|predicted|explained) by\\s+(?:the )?${P}${END}`), 2, 1, 'The variable that is affected by the other is dependent (Y); the other is independent (X).'],
  [R(`${P}\\s+(?:varies|changes|is a function of|as a function of)\\s+(?:with\\s+)?(?:the )?${P}${END}`), 2, 1, 'The variable that changes with the other is dependent (Y); the other is independent (X).'],
  [R(`${P}\\s+(?:based on|depending on)\\s+(?:the )?${P}${END}`), 2, 1, 'The variable "based on" the other is dependent (Y); the other is independent (X).'],
  [R(`${P}\\s+(?:affects?|influences?|impacts?|determines?|predicts?|explains?)\\s+(?:the )?${P}${END}`), 1, 2, 'The variable that affects or predicts the other is independent (X); the one that is affected is dependent (Y).'],
];

export function identifyVariables(raw) {
  const text = String(raw || '').replace(/\s+/g, ' ').trim().toLowerCase();
  if (text.length < 8) return { message: 'Type or paste the problem first.' };

  // 1) explicit labels
  const ind = new RegExp(`\\bindependent (?:variable|var\\.?)\\s*(?:is|are|=|:)?\\s*(?:the )?${P}${END2}`).exec(text);
  const dep = new RegExp(`\\bdependent (?:variable|var\\.?)\\s*(?:is|are|=|:)?\\s*(?:the )?${P}${END2}`).exec(text);
  if (ind && dep) return { x: clean(ind[1]), y: clean(dep[1]), reason: 'The problem states the independent and dependent variables directly.' };
  const xs = /(?:^|[\s,;(])x\s*[=:]\s*([a-z][a-z0-9'’ /%-]{1,50}?)(?=[,;.)]|\s+y\s*[=:]|$)/.exec(text);
  const ys = /(?:^|[\s,;(])y\s*[=:]\s*([a-z][a-z0-9'’ /%-]{1,50}?)(?=[,;.)]|$)/.exec(text);
  if (xs && ys) return { x: clean(xs[1]), y: clean(ys[1]), reason: 'The problem labels X and Y directly.' };

  // 2) cause-and-effect / prediction wording
  for (const [re, ix, iy, why] of RULES) {
    const m = re.exec(text);
    if (!m) continue;
    const x = clean(m[ix]), y = clean(m[iy]);
    if (x && y && x.toLowerCase() !== y.toLowerCase()) return { x, y, reason: why };
  }

  // 3) "relationship between A and B": order is ambiguous
  const b = new RegExp(`(?:relationship|correlation|association|link|connection|relation)\\s+between\\s+(?:the )?${P}\\s+and\\s+(?:the )?${P}${END}`).exec(text);
  if (b) {
    let a = clean(b[1]), c = clean(b[2]);
    if (a && c) {
      const aDep = DEP.test(a.toLowerCase()) && !INDEP.test(a.toLowerCase());
      const cIndep = INDEP.test(c.toLowerCase()) && !DEP.test(c.toLowerCase());
      let swapped = false;
      if (aDep && cIndep) { [a, c] = [c, a]; swapped = true; }
      return {
        x: a, y: c, guess: true,
        reason: swapped
          ? 'The problem only says there is a relationship between the two. Based on their meaning, the one that does the explaining (X) is likely independent, and the one being explained (Y) is dependent.'
          : 'The problem only says there is a relationship between the two, so I assumed the first one mentioned is independent (X) and the second is dependent (Y).',
      };
    }
  }

  return { message: 'I could not tell from the wording. Ask: which variable do I want to predict or explain? That one is Y (dependent). The variable I use to predict it is X (independent).' };
}