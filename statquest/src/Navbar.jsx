import { useState, useRef, useEffect } from 'react';

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
  onOpenLogin,
  onOpenSignup,
  onLogout,
  variant = 'hero', // 'hero' | 'solid'
}) {
  const [questsOpen, setQuestsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const questsRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (questsRef.current && !questsRef.current.contains(e.target)) {
        setQuestsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCover = page === 'cover';

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

          {/* Quests / Lessons Dropdown */}
          <div className="sq-dropdown-wrapper" ref={questsRef}>
            <button
              className={`sq-nav-link ${(page === 'regression' || page === 'ztest') ? 'active' : ''}`}
              onClick={() => setQuestsOpen(!questsOpen)}
              aria-expanded={questsOpen}
            >
              Lessons <span className="sq-chevron">{questsOpen ? '▴' : '▾'}</span>
            </button>
            {questsOpen && (
              <div className="sq-dropdown-menu">
                <button
                  className={`sq-dropdown-item ${page === 'regression' ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate('regression');
                    setQuestsOpen(false);
                  }}
                >
                  <span className="sq-item-icon"></span>
                  <div className="sq-item-text">
                    <b>Linear Regression</b>
                    <small>Fit lines, Pearson r, R², scatter plot</small>
                  </div>
                </button>
                <button
                  className={`sq-dropdown-item ${page === 'ztest' ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate('ztest');
                    setQuestsOpen(false);
                  }}
                >
                  <span className="sq-item-icon"></span>
                  <div className="sq-item-text">
                    <b>Hypothesis Testing</b>
                    <small>Z-tests &amp; t-tests in 7 steps</small>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            className={`sq-nav-link ${page === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            Adventure Mode
          </button>

          <button
            className={`sq-nav-link ${page === 'about' ? 'active' : ''}`}
            onClick={() => onNavigate('about')}
          >
            About
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
                <span className="sq-avatar">{currentUser.avatar || 'DM'}</span>
                <span className="sq-user-name">{currentUser.name}</span>
                <span className="sq-user-lvl">Lv.{currentUser.level || 1}</span>
              </button>

              {profileOpen && (
                <div className="sq-profile-dropdown">
                  <div className="sq-profile-header">
                    <span className="sq-profile-big-avatar">{currentUser.avatar || 'DM'}</span>
                    <div>
                      <div className="sq-profile-name">{currentUser.name}</div>
                      <div className="sq-profile-role">{currentUser.role || 'Data Mage'}</div>
                    </div>
                  </div>
                  <div className="sq-profile-stats">
                    <div>
                      <small>Adventurer Level</small>
                      <b>Level {currentUser.level || 1}</b>
                    </div>
                    <div>
                      <small>Current XP</small>
                      <b>{currentUser.xp || 0} XP</b>
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
                    Adventure Dashboard
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
