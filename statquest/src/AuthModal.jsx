import { useState, useEffect } from 'react';

const AVATARS = [
  { icon: '🧙‍♂️', role: 'Data Mage', desc: 'Master of regression lines and variance spells' },
  { icon: '⚔️', role: 'Stats Knight', desc: 'Defender of the null hypothesis and alpha levels' },
  { icon: '🏹', role: 'Probability Rogue', desc: 'Pinpoint precision with critical z and t values' },
  { icon: '🔮', role: 'Sigma Oracle', desc: 'Sees the true distribution behind the samples' },
  { icon: '🧮', role: 'Matrix Alchemist', desc: 'Transmutes raw tables into crystal clear findings' },
];

export default function AuthModal({ isOpen, initialTab = 'login', onClose, onLogin }) {
  const [tab, setTab] = useState(initialTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please enter both your Adventurer email and password.');
      return;
    }

    // Check local registered users list
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem('sq-users-list')) || [];
    } catch {
      users = [];
    }

    const found = users.find(
      (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
    );

    if (found) {
      if (found.password && found.password !== loginPassword) {
        setError('Incorrect password. Please try again.');
        return;
      }
      setSuccess(`Welcome back, ${found.name}!`);
      setTimeout(() => {
        onLogin(found);
        onClose();
      }, 500);
      return;
    }

    // If new login without prior signup, generate adventurer account
    const fallbackUser = {
      name: loginEmail.split('@')[0] || 'Adventurer',
      email: loginEmail,
      avatar: '🧙‍♂️',
      role: 'Data Mage',
      level: 1,
      xp: 10,
    };
    setSuccess(`Welcome, ${fallbackUser.name}!`);
    setTimeout(() => {
      onLogin(fallbackUser);
      onClose();
    }, 500);
  };

  const handleDemoLogin = () => {
    const demoUser = {
      name: 'Alex the Mage',
      email: 'alex@statquest.io',
      avatar: '🧙‍♂️',
      role: 'Data Mage',
      level: 3,
      xp: 40,
    };
    setSuccess('Logging in as Demo Adventurer...');
    setTimeout(() => {
      onLogin(demoUser);
      onClose();
    }, 400);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!signupName.trim()) {
      setError('Please choose an Adventurer name.');
      return;
    }
    if (!signupEmail.trim()) {
      setError('Please provide an email.');
      return;
    }
    if (signupPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match.');
      return;
    }

    const newUser = {
      name: signupName.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
      avatar: selectedAvatar.icon,
      role: selectedAvatar.role,
      level: 1,
      xp: 10,
    };

    // Save to users list
    try {
      const existing = JSON.parse(localStorage.getItem('sq-users-list')) || [];
      const updated = [...existing.filter((u) => u.email !== newUser.email), newUser];
      localStorage.setItem('sq-users-list', JSON.stringify(updated));
    } catch {}

    setSuccess(`Account created! Welcome, ${newUser.name}!`);
    setTimeout(() => {
      onLogin(newUser);
      onClose();
    }, 600);
  };

  return (
    <div className="sq-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sq-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="sq-modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Modal Tabs */}
        <div className="sq-modal-tabs">
          <button
            type="button"
            className={`sq-modal-tab pix ${tab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setTab('login');
              setError('');
              setSuccess('');
            }}
          >
            Log In
          </button>
          <button
            type="button"
            className={`sq-modal-tab pix ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setTab('signup');
              setError('');
              setSuccess('');
            }}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="err" style={{ marginBottom: 12, fontSize: '0.9rem' }}>{error}</div>}
        {success && <div className="found" style={{ marginBottom: 12, fontSize: '0.9rem' }}>{success}</div>}

        {/* ===================== LOG IN FORM ===================== */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="sq-auth-form">
            <h2 className="pix" style={{ fontSize: 15, margin: '4px 0 14px' }}>
              Adventurer Log In
            </h2>
            <label>
              Email or Adventurer ID
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. alex@statquest.io"
                autoFocus
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 16px' }}>
              <input type="checkbox" id="sq-rem" defaultChecked style={{ width: 'auto', margin: 0 }} />
              <label htmlFor="sq-rem" style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>
                Remember my adventurer session
              </label>
            </div>

            <button type="submit" className="btn sq-submit-btn pix" style={{ width: '100%', margin: '0 0 10px' }}>
              LOG IN
            </button>

            <div className="or" style={{ margin: '8px 0' }}>or explore instantly</div>

            <button
              type="button"
              className="btn ghost sm"
              style={{ width: '100%', padding: '10px 14px', margin: 0 }}
              onClick={handleDemoLogin}
            >
              🧙 Play as Demo Wizard (Alex - Lv. 3)
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: 14 }}>
              Don&apos;t have an account yet?{' '}
              <button
                type="button"
                className="sq-inline-link"
                onClick={() => {
                  setTab('signup');
                  setError('');
                  setSuccess('');
                }}
              >
                Sign Up here
              </button>
            </p>
          </form>
        )}

        {/* ===================== SIGN UP FORM ===================== */}
        {tab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="sq-auth-form">
            <h2 className="pix" style={{ fontSize: 15, margin: '4px 0 14px' }}>
              Join the Quest
            </h2>

            <label>
              Adventurer Name
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Ada Lovelace"
                autoFocus
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="e.g. ada@statquest.io"
              />
            </label>

            <div style={{ margin: '10px 0' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block', marginBottom: 6 }}>
                Choose Your Adventurer Class
              </span>
              <div className="sq-avatar-grid">
                {AVATARS.map((av) => (
                  <button
                    type="button"
                    key={av.role}
                    className={`sq-avatar-choice ${selectedAvatar.role === av.role ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(av)}
                  >
                    <span className="sq-avatar-emoji">{av.icon}</span>
                    <span className="sq-avatar-label">{av.role}</span>
                  </button>
                ))}
              </div>
              <small className="hint" style={{ marginTop: 4 }}>
                {selectedAvatar.icon} <b>{selectedAvatar.role}</b>: {selectedAvatar.desc}
              </small>
            </div>

            <div className="pair">
              <label>
                Password
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="At least 4 characters"
                />
              </label>
              <label>
                Confirm Password
                <input
                  type="password"
                  value={signupConfirm}
                  onChange={(e) => setSignupConfirm(e.target.value)}
                  placeholder="Repeat password"
                />
              </label>
            </div>

            <button type="submit" className="btn sq-submit-btn pix" style={{ width: '100%', margin: '14px 0 10px' }}>
              CREATE ACCOUNT
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: 10 }}>
              Already have an account?{' '}
              <button
                type="button"
                className="sq-inline-link"
                onClick={() => {
                  setTab('login');
                  setError('');
                  setSuccess('');
                }}
              >
                Log In here
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
