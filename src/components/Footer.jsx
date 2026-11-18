import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="nav-logo" style={{ fontSize: '1.4rem', textDecoration: 'none', color: 'var(--c-text)' }}>
              <span className="nav-logo-icon">🚨</span> ResQNet
            </Link>
            <p className="footer-desc">
              AI-powered disaster relief coordination pipeline. Bridging reporting channels, warehouses, dynamic routing, and proof of delivery into a single unified record.
            </p>
          </div>
          <div>
            <div className="footer-col-title">Pages</div>
            <ul className="footer-links">
              <li><Link to="/">Home Overview</Link></li>
              <li><Link to="/pipeline">9-Stage Pipeline</Link></li>
              <li><Link to="/architecture">Architecture & ML</Link></li>
              <li><Link to="/dashboard">Operations Control Room</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Core Technologies</div>
            <ul className="footer-links">
              <li><a href="#tech" onClick={(e) => e.preventDefault()}>FastAPI + Python 3.11</a></li>
              <li><a href="#tech" onClick={(e) => e.preventDefault()}>Google OR-Tools VRP</a></li>
              <li><a href="#tech" onClick={(e) => e.preventDefault()}>PostgreSQL + PostGIS</a></li>
              <li><a href="#tech" onClick={(e) => e.preventDefault()}>WebSockets Live Telemetry</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 ResQNet. Smart Disaster Relief Coordination & Logistics Platform.</span>
          <span className="live-indicator">All 4 Systems Online</span>
        </div>
      </div>
    </footer>
  );
}
