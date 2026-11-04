import { lazy, Suspense } from 'react';

const BlockMath = lazy(() => import('react-katex').then(({ BlockMath: Component }) => ({ default: Component })));
const InlineMath = lazy(() => import('react-katex').then(({ InlineMath: Component }) => ({ default: Component })));

function renderError(math) {
  return <span className="formula-error" title="Formula could not be rendered">{math}</span>;
}

export function InlineFormula({ math }) {
  return (
    <span className="math-inline">
      <Suspense fallback={renderError(math)}>
        <InlineMath math={math} renderError={() => renderError(math)} />
      </Suspense>
    </span>
  );
}

export default function Formula({ title, math, description, variables, className }) {
  return (
    <figure className={`formula-card${className ? ` ${className}` : ''}`}>
      {title && <figcaption className="formula-title">{title}</figcaption>}
      <div className="formula-equation" role="math" aria-label={title || math}>
        <Suspense fallback={renderError(math)}>
          <BlockMath math={math} renderError={() => renderError(math)} />
        </Suspense>
      </div>
      {description && <p className="formula-description">{description}</p>}
      {variables?.length > 0 && (
        <dl className="formula-variables">
          {variables.map(([symbol, meaning]) => (
            <div key={symbol}>
              <dt><InlineFormula math={symbol} /></dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
      )}
    </figure>
  );
}
