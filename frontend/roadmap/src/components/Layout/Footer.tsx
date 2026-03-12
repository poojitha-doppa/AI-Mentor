export default function Footer() {
  const isProduction = import.meta.env.MODE === 'production'
  const moduleUrls = isProduction
    ? {
        course: 'https://careersync-course-gen-oldo.onrender.com',
        roadmap: 'https://careersync-roadmap-oldo.onrender.com',
        skillEval: 'https://career-sync-skill-evalutor.onrender.com'
      }
    : {
        course: 'http://localhost:3002',
        roadmap: 'http://localhost:5173',
        skillEval: 'http://localhost:3001'
      }

  return (
    <footer className="footer-premium">
      <div className="footer-container">
        <div className="footer-top footer-grid-4">
          <div className="footer-brand-col">
            <div className="brand brand-light" style={{ marginBottom: '1.5rem' }}>
              <div className="brand-icon" />
              Career Sync
            </div>
            <p className="footer-text">
              Engineered for the ambitious. The world's first AI-powered career orchestration platform.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon">𝕏</a>
              <a href="#" className="social-icon">In</a>
              <a href="#" className="social-icon">Gh</a>
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Product</h4>
            <ul className="footer-links">
              <li><a href={moduleUrls.course}>Course Generator</a></li>
              <li><a href={moduleUrls.roadmap}>Roadmap Engine</a></li>
              <li><a href={moduleUrls.skillEval}>Skill Evaluator</a></li>
              <li><a href="#">Enterprise</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Resources</h4>
            <ul className="footer-links">
              <li><a href="#">Documentation</a></li>
              <li><a href="#">API Reference</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Community</a></li>
            </ul>
          </div>

          <div className="newsletter-col">
            <h4 className="footer-heading">Stay Ahead</h4>
            <p className="footer-note">
              Join our intelligence network. No spam, just signals.
            </p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="enter@email.com" className="newsletter-input" required />
              <button type="submit" className="newsletter-btn">→</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-meta">© 2026 Career Sync Inc. All rights reserved.</div>
          <div className="footer-meta footer-links-inline">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
