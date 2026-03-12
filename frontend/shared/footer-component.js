// Shared Footer Component for Vanilla JS Apps

const isLocalhost = window.location.hostname.includes('localhost')
  || window.location.hostname === '127.0.0.1';
const moduleUrls = (typeof window.getModuleUrls === 'function')
  ? window.getModuleUrls()
  : (isLocalhost
      ? {
          landing: 'http://localhost:4173',
          course: 'http://localhost:3002',
          roadmap: 'http://localhost:5173',
          skillEval: 'http://localhost:3001'
        }
      : {
          landing: 'https://careersync-landing-oldo.onrender.com',
          course: 'https://careersync-course-gen-oldo.onrender.com',
          roadmap: 'https://careersync-roadmap-oldo.onrender.com',
          skillEval: 'https://career-sync-skill-evalutor.onrender.com'
        });

// Footer HTML Template
const createFooterHTML = () => {
  return `
    <footer style="
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: white;
      padding: 48px 0 24px;
      margin-top: 80px;
    ">
      <div style="
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
      ">
        <!-- Footer Content -->
        <div style="
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 32px;
        ">
          <!-- Brand Section -->
          <div>
            <div style="
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 16px;
            ">
              <div style="
                width: 40px;
                height: 40px;
                border-radius: 8px;
                background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 18px;
                box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
              ">C</div>
              <span style="
                font-size: 20px;
                font-weight: 600;
              ">Career Sync</span>
            </div>
            <p style="
              color: #94a3b8;
              line-height: 1.6;
              margin-bottom: 24px;
              max-width: 300px;
            ">
              AI-powered career development platform helping you master your professional future with precision.
            </p>
            <div style="display: flex; gap: 12px;">
              <a href="#" style="
                width: 40px;
                height: 40px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                text-decoration: none;
                transition: all 0.2s;
              " onmouseover="this.style.background='rgba(79, 70, 229, 0.5)'" 
                 onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" style="
                width: 40px;
                height: 40px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                text-decoration: none;
                transition: all 0.2s;
              " onmouseover="this.style.background='rgba(79, 70, 229, 0.5)'" 
                 onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" style="
                width: 40px;
                height: 40px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                text-decoration: none;
                transition: all 0.2s;
              " onmouseover="this.style.background='rgba(79, 70, 229, 0.5)'" 
                 onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          <!-- Product Links -->
          <div>
            <h3 style="
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 16px;
              color: white;
            ">Product</h3>
            <ul style="
              list-style: none;
              padding: 0;
              margin: 0;
            ">
              <li style="margin-bottom: 12px;">
                <a href="${moduleUrls.course}" style="
                  color: #94a3b8;
                  text-decoration: none;
                  transition: color 0.2s;
                " onmouseover="this.style.color='#4F46E5'" 
                   onmouseout="this.style.color='#94a3b8'">Course Generator</a>
              </li>
              <li style="margin-bottom: 12px;">
                <a href="${moduleUrls.roadmap}" style="
                  color: #94a3b8;
                  text-decoration: none;
                  transition: color 0.2s;
                " onmouseover="this.style.color='#4F46E5'" 
                   onmouseout="this.style.color='#94a3b8'">Roadmap Planner</a>
              </li>
              <li style="margin-bottom: 12px;">
                <a href="${moduleUrls.skillEval}" style="
                  color: #94a3b8;
                  text-decoration: none;
                  transition: color 0.2s;
                " onmouseover="this.style.color='#4F46E5'" 
                   onmouseout="this.style.color='#94a3b8'">Skill Evaluator</a>
              </li>
            </ul>
          </div>

          <!-- Company Links -->
          <div>
            <h3 style="
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 16px;
              color: white;
            ">Company</h3>
            <ul style="
              list-style: none;
              padding: 0;
              margin: 0;
            ">
              <li style="margin-bottom: 12px;">
                <a href="#" style="
                  color: #94a3b8;
                  text-decoration: none;
                  transition: color 0.2s;
                " onmouseover="this.style.color='#4F46E5'" 
                   onmouseout="this.style.color='#94a3b8'">About Us</a>
              </li>
              <li style="margin-bottom: 12px;">
                <a href="#" style="
                  color: #94a3b8;
                  text-decoration: none;
                  transition: color 0.2s;
                " onmouseover="this.style.color='#4F46E5'" 
                   onmouseout="this.style.color='#94a3b8'">Careers</a>
              </li>
              <li style="margin-bottom: 12px;">
                <a href="#" style="
                  color: #94a3b8;
                  text-decoration: none;
                  transition: color 0.2s;
                " onmouseover="this.style.color='#4F46E5'" 
                   onmouseout="this.style.color='#94a3b8'">Contact</a>
              </li>
            </ul>
          </div>

          <!-- Legal Links -->
          <div>
            <h3 style="
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 16px;
              color: white;
            ">Legal</h3>
            <ul style="
              list-style: none;
              padding: 0;
              margin: 0;
            ">
              <li style="margin-bottom: 12px;">
                <a href="#" style="
                  color: #94a3b8;
                  text-decoration: none;
                  transition: color 0.2s;
                " onmouseover="this.style.color='#4F46E5'" 
                   onmouseout="this.style.color='#94a3b8'">Privacy Policy</a>
              </li>
              <li style="margin-bottom: 12px;">
                <a href="#" style="
                  color: #94a3b8;
                  text-decoration: none;
                  transition: color 0.2s;
                " onmouseover="this.style.color='#4F46E5'" 
                   onmouseout="this.style.color='#94a3b8'">Terms of Service</a>
              </li>
              <li style="margin-bottom: 12px;">
                <a href="#" style="
                  color: #94a3b8;
                  text-decoration: none;
                  transition: color 0.2s;
                " onmouseover="this.style.color='#4F46E5'" 
                   onmouseout="this.style.color='#94a3b8'">Cookie Policy</a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div style="
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #64748b;
          font-size: 14px;
        ">
          <p style="margin: 0;">© 2026 Career Sync. All rights reserved.</p>
          <p style="margin: 0;">Powered by AI 🚀</p>
        </div>
      </div>
    </footer>
  `;
};

// Initialize and render footer
function initFooter() {
  // Find or create footer container
  let footerContainer = document.getElementById('app-footer');
  if (!footerContainer) {
    footerContainer = document.createElement('div');
    footerContainer.id = 'app-footer';
    document.body.appendChild(footerContainer);
  }
  
  // Render footer
  footerContainer.innerHTML = createFooterHTML();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFooter);
} else {
  initFooter();
}

// Export for manual initialization if needed
export { initFooter };
