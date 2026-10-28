export default function Cover({ onStart, onLearn }) {
  return (
    <section className="cover" aria-label="StatQuest cover page">
      <div className="cover-inner">
        <svg width="64" height="64" viewBox="0 0 16 16" aria-hidden="true" shapeRendering="crispEdges">
          <rect width="16" height="16" rx="3" fill="#7C4DFF" />
          <rect x="2" y="9" width="2" height="5" fill="#FFF8EC" /><rect x="5" y="6" width="2" height="8" fill="#FFF8EC" />
          <rect x="8" y="8" width="2" height="6" fill="#FFD66B" /><rect x="11" y="3" width="2" height="11" fill="#FFF8EC" />
        </svg>
        {/* <p className="pix cover-kicker"></p> */}
        <h1 className="pix cover-title">StatQuest</h1>
        <p className="cover-tag">Your adventure in statistical analysis.</p>
        <ul className="cover-chips">
          <li>Simple Linear Regression</li>
          <li>Z-tests &amp; t-tests</li>
          <li>Step-by-step solutions</li>
        </ul>
        <div className="row cover-actions">
          <button className="btn cover-start" autoFocus onClick={onStart}>▶ START</button>
          <button className="btn ghost" onClick={onLearn}>How it works</button>
        </div>
      </div>
    </section>
  );
}