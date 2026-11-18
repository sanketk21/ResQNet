import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu, Database, WifiOff, Activity,
  ArrowRight, LayoutDashboard, GitBranch, Zap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { dataTables, mlTasks } from '../data';
import './Architecture.css';

export default function Architecture() {
  const [selectedTable, setSelectedTable] = useState(dataTables[0]?.name || 'Demands');

  return (
    <>
      <Navbar />

      <main className="arch-page">
        <div className="container">
          {/* Header */}
          <div className="arch-hero animate-in">
            <div className="page-badge">
              <Cpu size={14} /> Full Technical Specification
            </div>
            <h1 className="page-title">
              System Architecture & <span className="highlight">AI Decision Engines</span>
            </h1>
            <p className="page-subtitle">
              Engineered with a high-throughput FastAPI backend, PostGIS spatial indexing,
              Google OR-Tools routing, and 3 specialized machine learning models for low-latency relief operations.
            </p>
          </div>

          {/* End-to-End System Flow */}
          <div className="arch-flow-container animate-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>End-to-End System Topology</h2>
                <p style={{ fontSize: '.9rem', color: 'var(--c-text-secondary)' }}>
                  Directional pipeline flow from distributed edge inputs to verified delivery confirmation.
                </p>
              </div>
              <span className="live-indicator">Zero-SPOF Topology</span>
            </div>

            <div className="arch-flow-grid">
              {/* Col 1: Ingestion */}
              <div className="arch-col">
                <div className="arch-col-header">
                  <span>1. Edge Ingestion</span>
                  <span className="arch-col-badge">Clients</span>
                </div>
                <div className="arch-node">
                  <div className="arch-node-title">📱 Field PWA</div>
                  <div className="arch-node-tech">React + Vite + SQLite</div>
                  <div className="arch-node-desc">Runs offline on Android & iOS. Local storage caches photos and GPS coordinates.</div>
                </div>
                <div className="arch-node">
                  <div className="arch-node-title">💬 WhatsApp Gateway</div>
                  <div className="arch-node-tech">Twilio Webhook + FastAPI</div>
                  <div className="arch-node-desc">Parses free-form Hindi & Bengali text with LLM intent extraction into JSON.</div>
                </div>
                <div className="arch-node">
                  <div className="arch-node-title">🖥️ Operations Portal</div>
                  <div className="arch-node-tech">Leaflet + WebSockets</div>
                  <div className="arch-node-desc">High-frequency situational map for NDRF district magistrates and camp chiefs.</div>
                </div>
              </div>

              {/* Col 2: API & Gateway */}
              <div className="arch-col">
                <div className="arch-col-header">
                  <span>2. Gateway Layer</span>
                  <span className="arch-col-badge">Core API</span>
                </div>
                <div className="arch-node core-hub">
                  <div className="arch-node-title">⚡ FastAPI Async Hub</div>
                  <div className="arch-node-tech">Python 3.11 + Uvicorn</div>
                  <div className="arch-node-desc">Sub-10ms request routing, JWT security token validation, and rate-limiting.</div>
                </div>
                <div className="arch-node">
                  <div className="arch-node-title">📡 WebSocket Broker</div>
                  <div className="arch-node-tech">FastAPI Pub/Sub</div>
                  <div className="arch-node-desc">Broadcasts telemetry, roadblock reroutes, and verified deliveries instantly.</div>
                </div>
                <div className="arch-node">
                  <div className="arch-node-title">🛡️ Input Validator</div>
                  <div className="arch-node-tech">Pydantic v2 + Turf.js</div>
                  <div className="arch-node-desc">Validates payload structure, sanitizes EXIF geotags, and bounds coordinates.</div>
                </div>
              </div>

              {/* Col 3: Compute & ML */}
              <div className="arch-col">
                <div className="arch-col-header">
                  <span>3. Compute Engines</span>
                  <span className="arch-col-badge">Solvers</span>
                </div>
                <div className="arch-node core-hub">
                  <div className="arch-node-title">🎯 OR-Tools VRP Solver</div>
                  <div className="arch-node-tech">Google OR-Tools C++</div>
                  <div className="arch-node-desc">Calculates capacity-constrained multi-depot vehicle routes in under 250ms.</div>
                </div>
                <div className="arch-node">
                  <div className="arch-node-title">🧠 ML Intelligence Pipeline</div>
                  <div className="arch-node-tech">XGBoost + LightGBM</div>
                  <div className="arch-node-desc">Assesses road breach hazards and detects inflated demand anomalies.</div>
                </div>
                <div className="arch-node">
                  <div className="arch-node-title">🔄 Reconciliation Engine</div>
                  <div className="arch-node-tech">Transactional Unit</div>
                  <div className="arch-node-desc">Atomic deduction of stock upon verified delivery with idempotency guards.</div>
                </div>
              </div>

              {/* Col 4: Data Layer */}
              <div className="arch-col">
                <div className="arch-col-header">
                  <span>4. Persistence</span>
                  <span className="arch-col-badge">PostGIS</span>
                </div>
                <div className="arch-node">
                  <div className="arch-node-title">🗄️ PostgreSQL + PostGIS</div>
                  <div className="arch-node-tech">Spatial DB (AWS RDS)</div>
                  <div className="arch-node-desc">R-tree indexed spatial queries: ST_DWithin, ST_Intersects for instant geofences.</div>
                </div>
                <div className="arch-node">
                  <div className="arch-node-title">⚡ Redis Cache</div>
                  <div className="arch-node-tech">In-Memory Cluster</div>
                  <div className="arch-node-desc">Caches active truck coordinates, route geometry buffers, and session tokens.</div>
                </div>
                <div className="arch-node">
                  <div className="arch-node-title">🛰️ Weather & Hydro Feeds</div>
                  <div className="arch-node-tech">CWC & IMD APIs</div>
                  <div className="arch-node-desc">Periodic polling for upstream river crest levels and precipitation forecasts.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Relational Data Model (7 Tables) */}
          <div className="data-model-section animate-in">
            <div className="section-label">
              <Database size={14} /> Relational Schema
            </div>
            <h2 className="section-title">The 7-Table Relational Data Model</h2>
            <p className="section-subtitle">
              Fully normalized relational architecture with first-class spatial geometry types (PostGIS Points & MultiLineStrings).
            </p>

            <div className="data-tables-grid">
              {dataTables.map(t => (
                <div
                  className={`card data-table-card ${selectedTable === t.name ? 'selected-table' : ''}`}
                  key={t.name}
                  onClick={() => setSelectedTable(t.name)}
                >
                  <div className="dt-header">
                    <span style={{ fontSize: '1.4rem' }}>{t.icon}</span>
                    <span className="dt-name">{t.name}</span>
                    <span className="dt-count">{t.records} records</span>
                  </div>
                  <div className="dt-columns">
                    {t.columns.map((col, idx) => (
                      <div className="dt-col" key={col}>
                        <span className="dt-col-key">{idx === 0 ? 'PK' : idx < 3 ? 'FK' : '•'}</span>
                        <span>{col}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Machine Learning Tasks */}
          <div className="ml-section animate-in">
            <div className="section-label">
              <Activity size={14} /> Decision Intelligence
            </div>
            <h2 className="section-title">3 Focused Machine Learning Models</h2>
            <p className="section-subtitle">
              Rather than an opaque monolithic model, ResQNet deploys three specialized tabular and spatial models tuned for high reliability during disasters.
            </p>

            <div className="ml-grid">
              {mlTasks.map((task, i) => (
                <div className="card ml-card" key={i}>
                  <div className="ml-badge-top">
                    <span style={{ fontSize: '2rem' }}>{task.icon}</span>
                    <span className="badge badge-status">{task.model}</span>
                  </div>
                  <h3 className="ml-title">{task.name}</h3>
                  <p className="ml-desc">{task.desc}</p>
                  
                  <div style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-text-muted)', marginBottom: 8 }}>
                    Input Features
                  </div>
                  <div className="ml-features">
                    {task.features.map(f => (
                      <span className="ml-tag" key={f}>{f}</span>
                    ))}
                  </div>

                  <div className="ml-stats-row">
                    <div>
                      <div className="ml-stat-lbl">Validated Accuracy</div>
                      <div className="ml-stat-val">{task.accuracy}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="ml-stat-lbl">Inference Time</div>
                      <div className="ml-stat-val" style={{ color: 'var(--c-warning)' }}>&lt; 14ms</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Offline Resilience & Edge Sync */}
          <div className="offline-section animate-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <WifiOff size={22} color="var(--c-primary)" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Offline Resilience & Edge Sync Workflow</h2>
            </div>
            <p style={{ color: 'var(--c-text-secondary)', fontSize: '.95rem', maxWidth: 700 }}>
              Cell towers routinely fail during flood events. Field volunteers can queue reports completely offline; the device automatically syncs with transaction safety once network is restored.
            </p>

            <div className="offline-flow">
              {[
                { icon: '📝', label: '1. Volunteer Submits', desc: 'Form completed offline in camp' },
                { icon: '💾', label: '2. SQLite Indexed', desc: 'Cached locally with hash check' },
                { icon: '📶', label: '3. Signal Detected', desc: 'Background service checks ping' },
                { icon: '🔄', label: '4. Batch Idempotency', desc: 'Payload uploaded with retry' },
                { icon: '✅', label: '5. Pipeline Commit', desc: 'Verified and queued for dispatch' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="offline-step">
                    <div className="offline-step-icon">{s.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{s.label}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--c-text-secondary)', maxWidth: 140 }}>{s.desc}</div>
                  </div>
                  {i < 4 && <div className="offline-arrow">→</div>}
                </div>
              ))}
            </div>
          </div>

          {/* System Performance & Latency Benchmarks */}
          <div style={{ marginBottom: 64 }}>
            <div className="section-label">
              <Zap size={14} /> Performance Benchmarks
            </div>
            <h2 className="section-title">Field Performance Metrics</h2>
            <p className="section-subtitle">Stress-tested for thousands of concurrent requests across constrained network conditions.</p>

            <div className="benchmarks-grid">
              <div className="card benchmark-card">
                <div className="bm-value">&lt; 85ms</div>
                <div className="bm-label">Ingestion Latency</div>
                <div className="bm-sub">FastAPI async endpoint</div>
              </div>
              <div className="card benchmark-card">
                <div className="bm-value">&lt; 240ms</div>
                <div className="bm-label">VRP Route Solver</div>
                <div className="bm-sub">Google OR-Tools 25 stops</div>
              </div>
              <div className="card benchmark-card">
                <div className="bm-value">&lt; 15ms</div>
                <div className="bm-label">Geofence Check</div>
                <div className="bm-sub">PostGIS ST_DWithin query</div>
              </div>
              <div className="card benchmark-card">
                <div className="bm-value">500+</div>
                <div className="bm-label">Offline Queue</div>
                <div className="bm-sub">Encrypted local SQLite rows</div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pipeline-cta animate-in">
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>
              Explore ResQNet in Action
            </h2>
            <p style={{ color: 'var(--c-text-secondary)', maxWidth: 600, margin: '0 auto 24px', lineHeight: 1.7 }}>
              Walk through the 9-stage operational pipeline or open the live emergency operations dashboard.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/pipeline" className="btn btn-secondary">
                <GitBranch size={18} /> Inspect 9-Stage Pipeline
              </Link>
              <Link to="/dashboard" className="btn btn-primary">
                <LayoutDashboard size={18} /> Open Operations Control Room <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
