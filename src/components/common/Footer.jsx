import "./Footer.css";

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand-info">
            <h4>Brainware University (BWU)</h4>
            <p>Department of Computational Sciences (CSS) • Barasat, Kolkata</p>
            <p className="footer-desc">
              Bachelor of Computer Applications (BCA) — Full Stack Web Project 2
            </p>
          </div>

          <div className="footer-dev-card">
            <span className="dev-tag">Developer & Student Details</span>
            <div className="dev-name">SUMAN KUMAR DAS</div>
            <div className="dev-roll">
              Student Code / Roll: <code>BWU/BCA/24/255</code>
            </div>
            <div className="dev-project">Project: Shared Expense Splitter</div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="tech-tags">
            <span className="tech-pill">React 19</span>
            <span className="tech-pill">React Router v7</span>
            <span className="tech-pill">Component Architecture</span>
            <span className="tech-pill">Hooks (useState, useEffect, useMemo)</span>
            <span className="tech-pill">Array Operations (.map, .filter, .reduce)</span>
            <span className="tech-pill">Min-Cash-Flow Algorithm</span>
          </div>
          <div className="copyright">
            © 2026 Suman Kumar Das • Brainware University. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
