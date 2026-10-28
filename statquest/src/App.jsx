import { useState, useEffect } from 'react';
import Cover from './cover';
import Regression from './Regression';
import ZTest from './ZTest';
import About from './About';

const load = () => { try { return JSON.parse(localStorage.getItem('sq-history')) || []; } catch { return []; } };

const Logo = () => (
  <svg width="34" height="34" viewBox="0 0 16 16" aria-hidden="true" shapeRendering="crispEdges">
    <rect width="16" height="16" rx="3" fill="#7C4DFF" />
    <rect x="2" y="9" width="2" height="5" fill="#FFF8EC" /><rect x="5" y="6" width="2" height="8" fill="#FFF8EC" />
    <rect x="8" y="8" width="2" height="6" fill="#FFD66B" /><rect x="11" y="3" width="2" height="11" fill="#FFF8EC" />
  </svg>
);

export default function App() {
  const [page, setPage] = useState('cover');
  const [history, setHistory] = useState(load);
  useEffect(() => { try { localStorage.setItem('sq-history', JSON.stringify(history)); } catch {} }, [history]);
  useEffect(() => { window.scrollTo(0, 0); }, [page]);
  const save = (e) => setHistory((h) => [{ ...e, at: new Date().toLocaleString() }, ...h].slice(0, 20));
  const count = (m) => history.filter((h) => h.module === m).length;
  const pct = (m) => Math.min(count(m) * 34, 100);
  const tabs = [['home', 'Dashboard'], ['regression', 'Regression'], ['ztest', 'Hypothesis Test'], ['about', 'About']];
  const badges = [
    ['🌱 First Analysis', history.length >= 1],
    ['📈 Regression Rookie', count('regression') >= 1],
    ['🎯 Hypothesis Hunter', count('ztest') >= 1],
    ['🏆 Both Modules', count('regression') >= 1 && count('ztest') >= 1],
  ];

  if (page === 'cover') return <Cover onStart={() => setPage('home')} onLearn={() => setPage('about')} />;

  return (
    <div className="app-bg">
      <header className="top">
        <button className="brand" onClick={() => setPage('cover')} aria-label="Back to the cover page"><Logo /><span className="pix">StatQuest</span></button>
        <nav aria-label="Main">
          {tabs.map(([k, l]) => (
            <button key={k} className={'tab' + (page === k ? ' on' : '')} onClick={() => setPage(k)}>{l}</button>
          ))}
        </nav>
      </header>
      <main className="wrap">
        {page === 'home' && (
          <>
            <h1 className="pix">Welcome, adventurer!</h1>
            <p className="lead">StatQuest — your adventure in statistical analysis. Pick a quest below.</p>
            <div className="grid2">
              {[['regression', '📈 Simple Linear Regression', 'Fit a line, find r and R², and see the scatter plot.'],
                ['ztest', '🎯 Hypothesis Testing', 'Solve Z-tests and t-tests (one- and two-sample) in 7 steps.']].map(([k, t, d]) => (
                <section className="card" key={k}>
                  <h2>{t}</h2><p>{d}</p>
                  <div className="bar" role="progressbar" aria-valuenow={pct(k)} aria-valuemin="0" aria-valuemax="100"><i style={{ width: pct(k) + '%' }} /></div>
                  <small>{count(k)} analyses completed (3 fills the bar)</small><br />
                  <button className="btn" onClick={() => setPage(k)}>Quick start ▶</button>
                </section>
              ))}
            </div>
            <div className="grid2">
              <section className="card">
                <h2>⭐ XP: {history.length * 10}</h2>
                <div className="badges">{badges.map(([l, on]) => <span key={l} className={'badge' + (on ? ' on' : '')}>{l}</span>)}</div>
                <h3>Tip</h3>
                <p>Correlation is not causation: a strong r shows that two variables move together, not that one causes the other.</p>
              </section>
              <section className="card">
                <h2>🕑 Recent analyses</h2>
                {history.length === 0 ? <p>Nothing yet. Run an analysis and it will show up here.</p> : (
                  <ul className="hist">{history.slice(0, 5).map((h, i) => (
                    <li key={i}><b>{h.module === 'regression' ? 'Regression' : 'Hypothesis test'}:</b> {h.title}<br /><small>{h.detail} · {h.at}</small></li>
                  ))}</ul>
                )}
                {history.length > 0 && <button className="btn ghost" onClick={() => setHistory([])}>Clear history</button>}
              </section>
            </div>
          </>
        )}
        {page === 'regression' && <Regression onSave={save} />}
        {page === 'ztest' && <ZTest onSave={save} />}
        {page === 'about' && <About />}
      </main>
    </div>
  );
}