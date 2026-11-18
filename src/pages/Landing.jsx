import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, GitBranch, Cpu, ArrowRight,
  MapPin, AlertTriangle, Activity
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { villages, warehouses } from '../data';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Landing.css';

/* Leaflet default icon fix */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ── Animated Counter Hook ─────────── */
function useCounter(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
}

/* ── Counter Card ──────────────────── */
function StatCard({ value, label }) {
  const [count, ref] = useCounter(value);
  return (
    <div className="hero-stat" ref={ref}>
      <div className="hero-stat-value">{count.toLocaleString()}</div>
      <div className="hero-stat-label">{label}</div>
    </div>
  );
}

export default function Landing() {
  return (
    <>
      <Navbar />

      {/* ═══ HERO SECTION ═══ */}
      <section className="hero" id="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="pulse-dot" />
                LIVE RELIEF COORDINATION LAYER
              </div>
              <h1 className="hero-title">
                When disaster hits,<br />
                <span className="highlight">coordination breaks down first.</span>
              </h1>
              <p className="hero-desc">
                ResQNet unites reporting channels, warehouse inventories, dynamic OR-Tools routing,
                and cryptographic delivery proof into a continuous 9-stage closed loop.
              </p>
              <div className="hero-actions">
                <Link to="/dashboard" className="btn btn-primary">
                  <LayoutDashboard size={18} /> Open Control Room
                </Link>
                <Link to="/pipeline" className="btn btn-secondary">
                  <GitBranch size={18} /> Explore 9-Stage Pipeline
                </Link>
              </div>

              <div className="hero-stats">
                <StatCard value={9120} label="People Served" />
                <StatCard value={56} label="Deliveries Completed" />
                <StatCard value={3} label="Warehouses Active" />
                <StatCard value={12} label="Pending Requests" />
              </div>
            </div>

            {/* Visual Radar Map Preview */}
            <div className="hero-visual">
              <div className="hero-map-container">
                <MapContainer
                  center={[25.85, 89.55]}
                  zoom={9}
                  scrollWheelZoom={false}
                  dragging={false}
                  zoomControl={false}
                  style={{ width: '100%', height: '100%', borderRadius: '16px' }}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  {villages.map(v => (
                    <CircleMarker
                      key={v.id}
                      center={[v.lat, v.lng]}
                      radius={8}
                      pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.7 }}
                    >
                      <Popup>
                        <strong>{v.name}</strong><br />Population: {v.population}
                      </Popup>
                    </CircleMarker>
                  ))}
                  {warehouses.map(w => (
                    <CircleMarker
                      key={w.id}
                      center={[w.lat, w.lng]}
                      radius={10}
                      pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.7 }}
                    >
                      <Popup>
                        <strong>{w.name}</strong><br />{w.org}
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
                <div className="hero-map-overlay" />
              </div>

              <div className="hero-floating-card card-1">
                <div className="fc-row">
                  <span style={{ fontSize: '1.2rem' }}>🔴</span>
                  <span className="fc-label">Critical Need</span>
                  <span className="live-indicator">LIVE</span>
                </div>
                <div className="fc-row">
                  <span className="fc-value">Sundarganj — 4,000L Water</span>
                </div>
                <div className="fc-row">
                  <span className="fc-label" style={{ fontSize: '.75rem' }}>Dispatched from Depot A</span>
                </div>
              </div>

              <div className="hero-floating-card card-2">
                <div className="fc-row">
                  <span style={{ fontSize: '1.2rem' }}>🚚</span>
                  <span className="fc-label">Truck T1 (OR-Tools Loop)</span>
                </div>
                <div className="fc-row">
                  <span className="fc-value">ETA: 25 min • Detour Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ THE 4 FAILURE POINTS ═══ */}
      <section className="section" id="problem">
        <div className="container">
          <div className="section-label">
            <AlertTriangle size={14} /> The Problem
          </div>
          <h2 className="section-title">
            Four failure points that<br />cost lives during disasters.
          </h2>
          <p className="section-subtitle">
            Flooding strikes across five villages at once. Needs arrive in disorganized waves while roads fail and reports outpace verification.
          </p>

          <div className="problem-grid">
            {[
              {
                icon: '📢',
                title: 'Uncoordinated Reporting',
                desc: 'Needs flood in through WhatsApp, field forms, and frantic phone calls with no single shared record. Response teams duplicate effort while remote camps remain invisible.',
                color: 'rgba(239, 68, 68, 0.1)',
                tag: 'Channel Fragmentation',
              },
              {
                icon: '📊',
                title: 'No Way to Verify Scale',
                desc: 'Inflated counts and panicked rumors drown out genuine life-threatening emergencies. 5,000 claimed vs 1,200 actual population wastes scarce rations.',
                color: 'rgba(249, 115, 22, 0.1)',
                tag: 'Data Distortion',
              },
              {
                icon: '📦',
                title: 'Supply Blind Spots',
                desc: 'Independent NGOs and state warehouses operate in silos. Multiple trucks drop food at the same camp while a neighboring village starves without medicine.',
                color: 'rgba(234, 179, 8, 0.1)',
                tag: 'Inventory Silos',
              },
              {
                icon: '🛤️',
                title: 'Roads Fail Mid-Delivery',
                desc: 'A flash flood submerges the main bridge. Drivers have no real-time telemetry or automated rerouting, stranding tons of vital relief on blocked routes.',
                color: 'rgba(37, 99, 235, 0.1)',
                tag: 'Routing Collapse',
              },
            ].map((p, i) => (
              <div className="card problem-card" key={i}>
                <div className="card-icon" style={{ background: p.color }}>{p.icon}</div>
                <div className="badge badge-status" style={{ marginBottom: 12 }}>{p.tag}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>{p.title}</div>
                <div style={{ fontSize: '.9rem', color: 'var(--c-text-secondary)', lineHeight: 1.7 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3 PLATFORM PILLARS (PAGE PREVIEWS) ═══ */}
      <section className="section" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
        <div className="container">
          <div className="section-label">
            <Activity size={14} /> The Platform
          </div>
          <h2 className="section-title">Three Core Pillars of ResQNet</h2>
          <p className="section-subtitle">
            Explore how the 9-stage pipeline, resilient system architecture, and real-time operations control room work in lockstep.
          </p>

          <div className="problem-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginTop: 40 }}>
            {/* Pillar 1: Pipeline */}
            <div className="card pillar-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: '2.5rem' }}>🔗</span>
                <span className="badge badge-critical">9 Stages</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>
                The 9-Stage Pipeline
              </h3>
              <p style={{ fontSize: '.9rem', color: 'var(--c-text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                Trace the full lifecycle of a disaster request: from multi-channel ingestion (WhatsApp, App, Gov) to 6-stage verification, constraint matching, OR-Tools routing, and cryptographic delivery proof.
              </p>
              <div style={{ borderTop: '1px solid var(--c-surface-border)', paddingTop: 16, marginTop: 'auto' }}>
                <Link to="/pipeline" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  <GitBranch size={16} /> Explore Pipeline & Deep-Dives <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Pillar 2: Architecture & ML */}
            <div className="card pillar-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: '2.5rem' }}>🧠</span>
                <span className="badge badge-status">FastAPI + 3 ML Models</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>
                Architecture & Intelligence
              </h3>
              <p style={{ fontSize: '.9rem', color: 'var(--c-text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                Inspect the 7-table PostGIS relational schema, async FastAPI architecture, offline SQLite edge synchronization, and 3 specialized machine learning models with 94%+ accuracy.
              </p>
              <div style={{ borderTop: '1px solid var(--c-surface-border)', paddingTop: 16, marginTop: 'auto' }}>
                <Link to="/architecture" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  <Cpu size={16} /> View Architecture & Schema <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Pillar 3: Control Room */}
            <div className="card pillar-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: '2.5rem' }}>🚨</span>
                <span className="live-indicator">LIVE FEED</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>
                Operations Control Room
              </h3>
              <p style={{ fontSize: '.9rem', color: 'var(--c-text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                Interactive command center displaying real-time vehicle telemetry, blocked road detours, inventory consumption charts, and filterable priority demand requests.
              </p>
              <div style={{ borderTop: '1px solid var(--c-surface-border)', paddingTop: 16, marginTop: 'auto' }}>
                <Link to="/dashboard" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <LayoutDashboard size={16} /> Open Control Room <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ REAL-TIME SCENARIO WALKTHROUGH ═══ */}
      <section className="section">
        <div className="container">
          <div className="section-label">
            <MapPin size={14} /> Field Scenario
          </div>
          <h2 className="section-title">Kurigram District Inundation Scenario</h2>
          <p className="section-subtitle">
            How ResQNet coordinated 5 remote flood camps during the active Brahmaputra River breach.
          </p>

          <div className="card-glass" style={{ padding: 36, marginTop: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 8, color: 'var(--c-primary)' }}>
                  1. Multi-Channel SOS Ingestion
                </div>
                <p style={{ fontSize: '.85rem', color: 'var(--c-text-secondary)', lineHeight: 1.6 }}>
                  Sundarganj (Pop. 3,400) was submerged. 1 WhatsApp text + 2 mobile reports ingested, cross-verified with census bounds to filter 8,000 claimed down to 3,400 realistic head count.
                </p>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 8, color: 'var(--c-warning)' }}>
                  2. Route Failure Avoidance
                </div>
                <p style={{ fontSize: '.85rem', color: 'var(--c-text-secondary)', lineHeight: 1.6 }}>
                  Road R1 (Rangpur–Sundarganj) flooded at Km 14. OR-Tools solver immediately rerouted Truck T1 via the elevated southern bypass, preventing vehicle stranding.
                </p>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 8, color: 'var(--c-accent)' }}>
                  3. Verified Cryptographic Delivery
                </div>
                <p style={{ fontSize: '.85rem', color: 'var(--c-text-secondary)', lineHeight: 1.6 }}>
                  4,000L clean drinking water handed over at 14:48. Camp chief entered OTP 8421; GPS verified within 12m. Inventory automatically rebalanced in Central Warehouse.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="section" style={{ padding: '64px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="card-glass cta-card">
            <h2 className="section-title" style={{ margin: '0 auto 16px', textAlign: 'center' }}>
              Experience the Live Coordination Center
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto 32px', textAlign: 'center', maxWidth: 540 }}>
              Access the live telemetry, interactive Leaflet relief map, inventory breakdowns, and real-time road status feeds.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/dashboard" className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '14px 36px' }}>
                <LayoutDashboard size={20} /> Open Live Control Room
              </Link>
              <Link to="/pipeline" className="btn btn-secondary" style={{ fontSize: '1.05rem', padding: '14px 36px' }}>
                <GitBranch size={20} /> Step Through Pipeline
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SHARED FOOTER ═══ */}
      <Footer />
    </>
  );
}
