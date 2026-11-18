import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Menu, X, GitBranch, Cpu, Home } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${currentPath === '/dashboard' ? 'dashboard-nav' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="nav-logo" onClick={() => setMobileOpen(false)}>
          <span className="nav-logo-icon">🚨</span>
          <span>ResQNet</span>
        </Link>

        <ul className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          <li>
            <Link
              to="/"
              className={currentPath === '/' ? 'active' : ''}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon-inline"><Home size={15} /></span>
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/pipeline"
              className={currentPath === '/pipeline' ? 'active' : ''}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon-inline"><GitBranch size={15} /></span>
              9-Stage Pipeline
            </Link>
          </li>
          <li>
            <Link
              to="/architecture"
              className={currentPath === '/architecture' ? 'active' : ''}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon-inline"><Cpu size={15} /></span>
              Architecture & AI
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard"
              className={`nav-cta ${currentPath === '/dashboard' ? 'active-cta' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <LayoutDashboard size={16} />
              Control Room
            </Link>
          </li>
        </ul>

        <button className="nav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
