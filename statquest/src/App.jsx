import { useState, useEffect } from 'react';
import Cover from './cover';
import Regression from './Regression';
import ZTest from './ZTest';
import About from './About';
import Lessons from './Lessons';
import Navbar from './Navbar';
import AuthModal from './AuthModal';
import { getExpertiseTier } from './stats';
import StatQuestChat from './chat/StatQuestChat.jsx';
import PixelIcon from './PixelIcon';

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
  const [preloadedReg, setPreloadedReg] = useState(null);
  const [preloadedHyp, setPreloadedHyp] = useState(null);

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

  const overallTier = getExpertiseTier(history.length);

  const badges = [
    ['First Analysis Completed', history.length >= 1],
    ['Regression Practitioner', count('regression') >= 1],
    ['Hypothesis Practitioner', count('ztest') >= 1],
    ['Dual-Module Competency', count('regression') >= 1 && count('ztest') >= 1],
    ['Statistical Proficiency', history.length >= 3],
    ['Senior Analytical Depth', history.length >= 6],
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

  const handleLaunchRegression = (problem = null) => {
    setPreloadedReg(problem);
    setPage('regression');
  };

  const handleLaunchZTest = (problem = null) => {
    setPreloadedHyp(problem);
    setPage('ztest');
  };

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
          historyCount={history.length}
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
            historyCount={history.length}
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
                    Welcome, {currentUser ? currentUser.name : 'Analyst'}!
                  </h1>
                  {currentUser && (
                    <span className="badge on" style={{ background: overallTier.color, color: '#1B1B3A', fontWeight: 800 }}>
                      {currentUser.avatar} {currentUser.role || overallTier.title}
                    </span>
                  )}
                </div>

                <p className="lead">
                  StatQuest — your statistical learning and analysis workspace. Select a module below to practice,
                  advance your expertise tier, and explore data.
                </p>

                <div className="grid2">
                  {[
                    [
                      'regression',
                      'Simple Linear Regression',
                      'Fit a line, find Pearson r & R², and inspect scatter plots with actual word problems.',
                      'lessons-regression',
                    ],
                    [
                      'ztest',
                      'Hypothesis Testing',
                      'Solve Z-tests and t-tests in 7 steps using actual Module 9 curriculum problems.',
                      'lessons-ztest',
                    ],
                  ].map(([k, t, d, lessonTarget]) => {
                    const modTier = getExpertiseTier(count(k));
                    return (
                      <section className="card" key={k}>
                        <h2 className="sq-module-title">
                          <PixelIcon name={k === 'regression' ? 'regression' : 'hypothesis'} className="sq-module-icon" />
                          {t}
                        </h2>
                        <p>{d}</p>

                        <div style={{ margin: '14px 0 10px', padding: '10px 12px', background: 'rgba(124, 77, 255, 0.15)', border: '1.5px solid #3F2B85', borderRadius: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <small style={{ color: '#A99BCF' }}>Expertise Level</small>
                            <span className="badge on" style={{ background: modTier.color, color: '#1B1B3A', fontSize: '0.75rem', fontWeight: 800 }}>
                              {modTier.label} ({modTier.rank})
                            </span>
                          </div>
                          <div style={{ fontSize: '0.86rem', color: '#EDE8FF' }}>
                            <b>{count(k)}</b> {count(k) === 1 ? 'analysis' : 'analyses'} completed
                            {modTier.needed > 0 && (
                              <span style={{ color: '#FFE9A8' }}> · {modTier.needed} more to {modTier.level === 1 ? 'Practitioner' : modTier.level === 2 ? 'Proficient' : modTier.level === 3 ? 'Advanced' : 'Master'}</span>
                            )}
                          </div>
                        </div>

                        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button className="btn sm" onClick={() => setPage(k)}>
                            Open Calculator
                          </button>
                          <button className="btn ghost sm" onClick={() => setPage(lessonTarget)}>
                            Read Lesson Module
                          </button>
                        </div>
                      </section>
                    );
                  })}
                </div>

                <div className="grid2">
                  <section className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 }}>
                      <h2>Overall Expertise: {overallTier.label}</h2>
                      <span className="badge on" style={{ background: overallTier.color, color: '#1B1B3A', fontWeight: 800 }}>
                        {overallTier.rank}
                      </span>
                    </div>

                    <p style={{ margin: '4px 0 12px', color: '#D8E2F0', fontSize: '0.92rem' }}>
                      <b>{overallTier.title}</b> — {overallTier.desc}
                    </p>

                    <div className="stats" style={{ margin: '10px 0 14px' }}>
                      <div>
                        <small>Total Analyses</small>
                        <b>{history.length}</b>
                      </div>
                      <div>
                        <small>Linear Regression</small>
                        <b>{count('regression')}</b>
                      </div>
                      <div>
                        <small>Hypothesis Tests</small>
                        <b>{count('ztest')}</b>
                      </div>
                    </div>

                    {!currentUser && (
                      <div style={{ marginBottom: 12 }}>
                        <button
                          className="btn ghost sm"
                          onClick={handleOpenSignup}
                          style={{ margin: 0 }}
                        >
                          Sign Up to save your profile &amp; progress
                        </button>
                      </div>
                    )}

                    <h3 style={{ margin: '14px 0 6px' }}>Competency Milestones</h3>
                    <div className="badges">
                      {badges.map(([l, on]) => (
                        <span key={l} className={'badge sq-achievement' + (on ? ' on' : '')}>
                          <PixelIcon name={on ? 'award' : 'star'} className="sq-achievement-icon" />
                          {l}
                        </span>
                      ))}
                    </div>

                    <h3 style={{ margin: '14px 0 6px' }}>Statistical Note</h3>
                    <p style={{ margin: 0, fontSize: '0.92rem' }}>
                      Correlation is not causation: a strong r shows that two variables move
                      together, not that one causes the other. Consult the Lessons tab for full theoretical assumptions.
                    </p>
                  </section>

                  <section className="card">
                    <h2>Recent analyses</h2>
                    {history.length === 0 ? (
                      <p>No analyses run yet. Solve a word problem in Regression or Hypothesis Testing to log it here.</p>
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
                      <button className="btn ghost sm" onClick={() => setHistory([])}>
                        Clear history
                      </button>
                    )}
                  </section>
                </div>
              </>
            )}

            {page === 'regression' && (
              <Regression
                onSave={save}
                initialProblem={preloadedReg}
                onNavigate={(p) => setPage(p)}
              />
            )}
            {page === 'ztest' && (
              <ZTest
                onSave={save}
                initialProblem={preloadedHyp}
                onNavigate={(p) => setPage(p)}
              />
            )}
            {page === 'lessons' && (
              <Lessons
                activeTab="regression"
                onNavigate={(p) => setPage(p)}
                onLaunchRegression={handleLaunchRegression}
                onLaunchZTest={handleLaunchZTest}
              />
            )}
            {page === 'lessons-regression' && (
              <Lessons
                activeTab="regression"
                onNavigate={(p) => setPage(p)}
                onLaunchRegression={handleLaunchRegression}
                onLaunchZTest={handleLaunchZTest}
              />
            )}
            {page === 'lessons-ztest' && (
              <Lessons
                activeTab="hypothesis"
                onNavigate={(p) => setPage(p)}
                onLaunchRegression={handleLaunchRegression}
                onLaunchZTest={handleLaunchZTest}
              />
            )}
            {page === 'about' && <About onNavigate={(p) => setPage(p)} />}
          </main>

          <footer className="sq-hero-footer">
            <div className="sq-footer-brand pix">StatQuest</div>
            <div className="sq-footer-copy">© 2026 StatQuest</div>
          </footer>
        </div>
      )}
      <StatQuestChat />
    </>
  );
}
