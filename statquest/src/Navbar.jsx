import { useState, useRef, useEffect } from 'react';
import { getExpertiseTier } from './stats';

const Logo = () => (
  <svg width="30" height="30" viewBox="0 0 16 16" aria-hidden="true" shapeRendering="crispEdges">
    <rect width="16" height="16" rx="3" fill="#7C4DFF" />
    <rect x="2" y="9" width="2" height="5" fill="#FFF8EC" />
    <rect x="5" y="6" width="2" height="8" fill="#FFF8EC" />
    <rect x="8" y="8" width="2" height="6" fill="#FFD66B" />
    <rect x="11" y="3" width="2" height="11" fill="#FFF8EC" />
  </svg>
);

export default function Navbar({
  page,
  onNavigate,
  currentUser,
  historyCount = 0,
  onOpenLogin,
  onOpenSignup,
  onLogout,
  variant = 'hero', // 'hero' | 'solid'
}) {
  const [lessonsOpen, setLessonsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const lessonsRef = useRef(null);
  const toolsRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (lessonsRef.current && !lessonsRef.current.contains(e.target)) {
        setLessonsOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setToolsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCover = page === 'cover';
  const isLessons = page === 'lessons' || page === 'lessons-regression' || page === 'lessons-ztest';
  const isTools = page === 'regression' || page === 'ztest';

  const userTier = getExpertiseTier(historyCount);

  return (
    <header className={`sq-nav ${variant === 'hero' ? 'sq-nav-hero' : 'sq-nav-solid'}`}>
      <div className="sq-nav-container">
        {/* Brand */}
        <button
          className="sq-nav-brand"
          onClick={() => onNavigate('cover')}
          aria-label="StatQuest Home"
        >
          <Logo />
          <span className="sq-nav-title pix">StatQuest</span>
        </button>

        {/* Center / Nav Items */}
        <nav className="sq-nav-links" aria-label="Main Navigation">
          <button
            className={`sq-nav-link ${isCover ? 'active' : ''}`}
            onClick={() => onNavigate('cover')}
          >
            Home
          </button>

          {/* Actual Learning Modules / Lessons Dropdown */}
          <div className="sq-dropdown-wrapper" ref={lessonsRef}>
            <button
              className={`sq-nav-link ${isLessons ? 'active' : ''}`}
              onClick={() => {
                setLessonsOpen(!lessonsOpen);
                setToolsOpen(false);
              }}
              aria-expanded={lessonsOpen}
            >
              Lessons <span className="sq-chevron">{lessonsOpen ? '▴' : '▾'}</span>
            </button>
            {lessonsOpen && (
              <div className="sq-dropdown-menu">
                <button
                  className={`sq-dropdown-item ${page === 'lessons' ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate('lessons');
                    setLessonsOpen(false);
                  }}
                >
                  <span className="sq-item-icon">📚</span>
                  <div className="sq-item-text">
                    <b>All Learning Modules</b>
                    <small>Theory, formulas, glossaries &amp; slide problems</small>
                  </div>
                </button>
                <button
                  className={`sq-dropdown-item ${page === 'lessons-regression' ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate('lessons-regression');
                    setLessonsOpen(false);
                  }}
                >
                  <span className="sq-item-icon">📘</span>
                  <div className="sq-item-text">
                    <b>Module 1: Linear Regression</b>
                    <small>Concepts, formulas, r &amp; R², worked examples</small>
                  </div>
                </button>
                <button
                  className={`sq-dropdown-item ${page === 'lessons-ztest' ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate('lessons-ztest');
                    setLessonsOpen(false);
                  }}
                >
                  <span className="sq-item-icon">📙</span>
                  <div className="sq-item-text">
                    <b>Module 2: Hypothesis Testing</b>
                    <small>7 steps, Z &amp; t tests, 8 slide problems</small>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Calculators / Tools Dropdown */}
          <div className="sq-dropdown-wrapper" ref={toolsRef}>
            <button
              className={`sq-nav-link ${isTools ? 'active' : ''}`}
              onClick={() => {
                setToolsOpen(!toolsOpen);
                setLessonsOpen(false);
              }}
              aria-expanded={toolsOpen}
            >
              Calculators <span className="sq-chevron">{toolsOpen ? '▴' : '▾'}</span>
            </button>
            {toolsOpen && (
              <div className="sq-dropdown-menu">
                <button
                  className={`sq-dropdown-item ${page === 'regression' ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate('regression');
                    setToolsOpen(false);
                  }}
                >
                  <span className="sq-item-icon">📈</span>
                  <div className="sq-item-text">
                    <b>Linear Regression Tool</b>
                    <small>Fit lines, Pearson r, R², scatter plot</small>
                  </div>
                </button>
                <button
                  className={`sq-dropdown-item ${page === 'ztest' ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate('ztest');
                    setToolsOpen(false);
                  }}
                >
                  <span className="sq-item-icon">⚖️</span>
                  <div className="sq-item-text">
                    <b>Hypothesis Testing Solver</b>
                    <small>Solve Z &amp; t tests in 7 steps with curve</small>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            className={`sq-nav-link ${page === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            Dashboard
          </button>

          <button
            className={`sq-nav-link ${page === 'about' ? 'active' : ''}`}
            onClick={() => onNavigate('about')}
          >
            How to Use
          </button>
        </nav>

        {/* Auth / Profile Area */}
        <div className="sq-nav-auth">
          {currentUser ? (
            <div className="sq-profile-wrapper" ref={profileRef}>
              <button
                className="sq-profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
              >
                <span className="sq-avatar">{currentUser.avatar || '📊'}</span>
                <span className="sq-user-name">{currentUser.name}</span>
                <span className="sq-user-lvl" style={{ background: userTier.color, color: '#1B1B3A', fontWeight: 800 }}>
                  {userTier.label}
                </span>
              </button>

              {profileOpen && (
                <div className="sq-profile-dropdown">
                  <div className="sq-profile-header">
                    <span className="sq-profile-big-avatar">{currentUser.avatar || '📊'}</span>
                    <div>
                      <div className="sq-profile-name">{currentUser.name}</div>
                      <div className="sq-profile-role">{currentUser.role || userTier.title}</div>
                    </div>
                  </div>
                  <div className="sq-profile-stats">
                    <div>
                      <small>Expertise Level</small>
                      <b>{userTier.label} ({userTier.rank})</b>
                    </div>
                    <div>
                      <small>Total Analyses</small>
                      <b>{historyCount} completed</b>
                    </div>
                  </div>
                  <button
                    className="btn sm"
                    style={{ width: '100%', margin: '8px 0 4px' }}
                    onClick={() => {
                      onNavigate('home');
                      setProfileOpen(false);
                    }}
                  >
                    Dashboard
                  </button>
                  <button
                    className="btn ghost sm"
                    style={{ width: '100%', margin: '4px 0 0' }}
                    onClick={() => {
                      onLogout();
                      setProfileOpen(false);
                    }}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="sq-auth-actions">
              <button className="sq-login-link" onClick={onOpenLogin}>
                Log in
              </button>
              <button className="sq-signup-btn pix" onClick={onOpenSignup}>
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
