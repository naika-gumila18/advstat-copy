import HeroBackground from './HeroBackground';
import Navbar from './Navbar';
import PixelIcon from './PixelIcon';

export default function Cover({
  onStart,
  onLearn,
  onNavigate,
  currentUser,
  historyCount = 0,
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
        historyCount={historyCount}
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
          Master the power of statistics through hands-on data analysis,
          hypothesis testing, and structured lessons.
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
            onClick={() => onNavigate('lessons')}
          >
            <PixelIcon name="book" className="sq-chip-icon" />
            <span>Learning Modules</span>
          </button>
          <button
            type="button"
            className="sq-chip-btn"
            onClick={() => onNavigate('regression')}
          >
            <PixelIcon name="regression" className="sq-chip-icon" />
            <span>Simple Linear Regression</span>
          </button>
          <button
            type="button"
            className="sq-chip-btn"
            onClick={() => onNavigate('ztest')}
          >
            <PixelIcon name="hypothesis" className="sq-chip-icon" />
            <span>Hypothesis Testing</span>
          </button>
          <button
            type="button"
            className="sq-chip-btn"
            onClick={() => onNavigate('home')}
          >
            <PixelIcon name="dashboard" className="sq-chip-icon" />
            <span>Expertise Dashboard</span>
          </button>
          <button
            type="button"
            className="sq-chip-btn"
            onClick={onLearn}
          >
            <PixelIcon name="idea" className="sq-chip-icon" />
            <span>How to Use</span>
          </button>
        </div>
      </div>

      {/* 4. Bottom Footer Bar */}
      <footer className="sq-hero-footer">
        <div className="sq-footer-brand pix">StatQuest</div>
        <div className="sq-footer-copy">© 2026 StatQuest</div>
      </footer>
    </section>
  );
}
