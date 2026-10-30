import HeroBackground from './HeroBackground';
import Navbar from './Navbar';

export default function Cover({
  onStart,
  onLearn,
  onNavigate,
  currentUser,
  onOpenLogin,
  onOpenSignup,
  onLogout,
}) {
  return (
    <section className="sq-hero-screen" aria-label="StatQuest Landing Page">
      {/* 1. Animated Living Pixel Background Canvas */}
      <HeroBackground />

      {/* 2. Top Navigation Bar matching the inspiration */}
      <Navbar
        page="cover"
        onNavigate={onNavigate}
        currentUser={currentUser}
        onOpenLogin={onOpenLogin}
        onOpenSignup={onOpenSignup}
        onLogout={onLogout}
        variant="hero"
      />

      {/* 3. Central Hero Content */}
      <div className="sq-hero-content">
        <p className="pix sq-hero-kicker">WELCOME TO</p>

        <h1 className="pix sq-hero-title">STATQUEST</h1>

        <p className="sq-hero-subtitle">
          Discover the power of statistics through a living world of data,
          probability, and discovery.
        </p>

        <div className="sq-hero-actions">
          <button
            className="sq-hero-cta pix"
            onClick={onStart}
            autoFocus
          >
            Get started
          </button>
        </div>

        {/* Feature badges / quick chips */}
        <div className="sq-hero-chips">
          <button
            type="button"
            className="sq-chip-btn"
            onClick={() => onNavigate('regression')}
          >
            <span className="sq-chip-icon"></span>
            <span>Simple Linear Regression</span>
          </button>
          <button
            type="button"
            className="sq-chip-btn"
            onClick={() => onNavigate('ztest')}
          >
            <span className="sq-chip-icon"></span>
            <span>Hypothesis Testing</span>
          </button>
          <button
            type="button"
            className="sq-chip-btn"
            onClick={() => onNavigate('home')}
          >
            <span className="sq-chip-icon"></span>
            <span>Adventure Mode &amp; XP</span>
          </button>
          <button
            type="button"
            className="sq-chip-btn"
            onClick={onLearn}
          >
            <span className="sq-chip-icon"></span>
            <span>How it works</span>
          </button>
        </div>
      </div>

      {/* 4. Bottom Footer Bar matching the inspo */}
      <footer className="sq-hero-footer">
        <div className="sq-footer-brand pix">StatQuest</div>
        <div className="sq-footer-copy">© 2026 StatQuest</div>
      </footer>
    </section>
  );
}
