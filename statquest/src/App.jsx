import { useState, useEffect } from 'react';
import Cover from './cover';
import Regression from './Regression';
import ZTest from './ZTest';
import About from './About';
import Navbar from './Navbar';
import AuthModal from './AuthModal';

const loadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('sq-history')) || [];
  } catch {
    return [];
  }
};

const loadUser = () => {
  try {
    return JSON.parse(localStorage.getItem('sq-user')) || null;
  } catch {
    return null;
  }
};

export default function App() {
  const [page, setPage] = useState('cover');
  const [history, setHistory] = useState(loadHistory);
  const [currentUser, setCurrentUser] = useState(loadUser);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  useEffect(() => {
    try {
      localStorage.setItem('sq-history', JSON.stringify(history));
    } catch {}
  }, [history]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('sq-user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('sq-user');
      }
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const save = (e) =>
    setHistory((h) => [{ ...e, at: new Date().toLocaleString() }, ...h].slice(0, 20));
  const count = (m) => history.filter((h) => h.module === m).length;
  const pct = (m) => Math.min(count(m) * 34, 100);

  const badges = [
    ['First Analysis', history.length >= 1],
    ['Regression Rookie', count('regression') >= 1],
    ['Hypothesis Hunter', count('ztest') >= 1],
    ['Both Modules', count('regression') >= 1 && count('ztest') >= 1],
  ];

  const handleOpenLogin = () => {
    setAuthTab('login');
    setAuthOpen(true);
  };

  const handleOpenSignup = () => {
    setAuthTab('signup');
    setAuthOpen(true);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const totalXp = (currentUser?.xp || 0) + history.length * 10;

  return (
    <>
      <AuthModal
        key={authTab + (authOpen ? '-open' : '-closed')}
        isOpen={authOpen}
        initialTab={authTab}
        onClose={() => setAuthOpen(false)}
        onLogin={handleLogin}
      />

      {page === 'cover' ? (
        <Cover
          onStart={() => setPage('home')}
          onLearn={() => setPage('about')}
          onNavigate={(p) => setPage(p)}
          currentUser={currentUser}
          onOpenLogin={handleOpenLogin}
          onOpenSignup={handleOpenSignup}
          onLogout={handleLogout}
        />
      ) : (
        <div className="app-bg">
          <Navbar
            page={page}
            onNavigate={(p) => setPage(p)}
            currentUser={currentUser}
            onOpenLogin={handleOpenLogin}
            onOpenSignup={handleOpenSignup}
            onLogout={handleLogout}
            variant="solid"
          />

          <main className="wrap">
            {page === 'home' && (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                  <h1 className="pix" style={{ margin: '8px 0 4px' }}>
                    Welcome, {currentUser ? currentUser.name : 'adventurer'}!
                  </h1>
                  {currentUser && (
                    <span className="badge on">
                      {currentUser.avatar} {currentUser.role || 'Adventurer'}
                    </span>
                  )}
                </div>

                <p className="lead">
                  StatQuest — your adventure in statistical analysis. Pick a quest below to earn XP
                  and uncover statistical insights.
                </p>

                <div className="grid2">
                  {[
                    [
                      'regression',
                      'Simple Linear Regression',
                      'Fit a line, find r and R², and inspect the scatter plot.',
                    ],
                    [
                      'ztest',
                      'Hypothesis Testing',
                      'Solve Z-tests and t-tests (one- and two-sample) in 7 steps.',
                    ],
                  ].map(([k, t, d]) => (
                    <section className="card" key={k}>
                      <h2>{t}</h2>
                      <p>{d}</p>
                      <div
                        className="bar"
                        role="progressbar"
                        aria-valuenow={pct(k)}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        <i style={{ width: pct(k) + '%' }} />
                      </div>
                      <small>{count(k)} analyses completed (3 fills the bar)</small>
                      <br />
                      <button className="btn" onClick={() => setPage(k)}>
                        Quick start
                      </button>
                    </section>
                  ))}
                </div>

                <div className="grid2">
                  <section className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2>XP: {totalXp}</h2>
                      {currentUser ? (
                        <small style={{ fontWeight: 700, color: '#B9A2FF' }}>
                          Lv. {currentUser.level || 1}
                        </small>
                      ) : (
                        <button
                          className="btn ghost sm"
                          onClick={handleOpenSignup}
                          style={{ margin: 0 }}
                        >
                          Sign Up to save XP
                        </button>
                      )}
                    </div>
                    <div className="badges">
                      {badges.map(([l, on]) => (
                        <span key={l} className={'badge' + (on ? ' on' : '')}>
                          {l}
                        </span>
                      ))}
                    </div>
                    <h3>Tip</h3>
                    <p>
                      Correlation is not causation: a strong r shows that two variables move
                      together, not that one causes the other.
                    </p>
                  </section>

                  <section className="card">
                    <h2>Recent analyses</h2>
                    {history.length === 0 ? (
                      <p>Nothing yet. Run an analysis and it will show up here.</p>
                    ) : (
                      <ul className="hist">
                        {history.slice(0, 5).map((h, i) => (
                          <li key={i}>
                            <b>{h.module === 'regression' ? 'Regression' : 'Hypothesis test'}:</b>{' '}
                            {h.title}
                            <br />
                            <small>
                              {h.detail} · {h.at}
                            </small>
                          </li>
                        ))}
                      </ul>
                    )}
                    {history.length > 0 && (
                      <button className="btn ghost" onClick={() => setHistory([])}>
                        Clear history
                      </button>
                    )}
                  </section>
                </div>
              </>
            )}

            {page === 'regression' && <Regression onSave={save} />}
            {page === 'ztest' && <ZTest onSave={save} />}
            {page === 'about' && <About />}
          </main>

          <footer className="sq-hero-footer">
            <div className="sq-footer-brand pix">StatQuest</div>
            <div className="sq-footer-copy">© 2026 StatQuest</div>
          </footer>
        </div>
      )}
    </>
  );
}
