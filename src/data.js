// ============================================================
// ResQNet — Demo Data Layer
// Replace these exports with fetch() calls to FastAPI backend
// ============================================================

export const villages = [
  { id: 'V1', name: 'Sundarganj Camp',    lat: 26.1250, lng: 89.5200, population: 1200, district: 'Rangpur' },
  { id: 'V2', name: 'Kurigram Shelter',   lat: 25.8120, lng: 89.6360, population: 3400, district: 'Kurigram' },
  { id: 'V3', name: 'Chilmari Village',   lat: 25.5530, lng: 89.6810, population: 870,  district: 'Kurigram' },
  { id: 'V4', name: 'Rowmari Camp',       lat: 25.6310, lng: 89.7660, population: 2100, district: 'Kurigram' },
  { id: 'V5', name: 'Nageshwari Shelter', lat: 25.9710, lng: 89.7200, population: 1550, district: 'Kurigram' },
];

export const warehouses = [
  { id: 'W1', name: 'Central Relief Hub', lat: 25.7470, lng: 89.2517, org: 'Government',    stock: { water: 10000, food: 5000, medicine: 2000, shelter: 300 } },
  { id: 'W2', name: 'NGO Forward Base',   lat: 25.9600, lng: 89.6300, org: 'Red Crescent',   stock: { water: 5000, food: 2500, medicine: 800, shelter: 150 } },
  { id: 'W3', name: 'District Depot',     lat: 26.0600, lng: 89.4400, org: 'District Admin',  stock: { water: 7500, food: 3200, medicine: 1200, shelter: 200 } },
];

export const vehicles = [
  { id: 'T1', driver: 'Rafiq Ahmed',   plate: 'RNG-2041', capacity: 5000, lat: 25.7500, lng: 89.2600, status: 'delivering', color: '#3B82F6' },
  { id: 'T2', driver: 'Kamal Hossain', plate: 'KUR-1188', capacity: 3000, lat: 25.9650, lng: 89.6350, status: 'delivering', color: '#10B981' },
  { id: 'T3', driver: 'Nasima Begum',  plate: 'RNG-3322', capacity: 4000, lat: 26.0650, lng: 89.4450, status: 'idle',       color: '#F59E0B' },
  { id: 'T4', driver: 'Jamal Uddin',   plate: 'KUR-4455', capacity: 6000, lat: 25.8200, lng: 89.5000, status: 'returning',  color: '#8B5CF6' },
];

export const demands = [
  { id: 'D001', villageId: 'V1', resource: 'water',    qty: 4000,  unit: 'L',     urgency: 'critical', status: 'verified',   reported: '2026-09-09T08:12:00', source: 'app',       reportedQty: 4000, estimatedNeed: 3600, verificationStep: 6 },
  { id: 'D002', villageId: 'V2', resource: 'food',     qty: 2500,  unit: 'packs', urgency: 'critical', status: 'dispatched', reported: '2026-09-09T07:45:00', source: 'whatsapp',  reportedQty: 5000, estimatedNeed: 2500, verificationStep: 6 },
  { id: 'D003', villageId: 'V3', resource: 'medicine', qty: 500,   unit: 'units', urgency: 'critical', status: 'matched',    reported: '2026-09-09T09:30:00', source: 'dashboard', reportedQty: 500,  estimatedNeed: 500,  verificationStep: 6 },
  { id: 'D004', villageId: 'V1', resource: 'shelter',  qty: 50,    unit: 'kits',  urgency: 'high',     status: 'verified',   reported: '2026-09-09T08:50:00', source: 'app',       reportedQty: 80,   estimatedNeed: 50,   verificationStep: 5 },
  { id: 'D005', villageId: 'V4', resource: 'water',    qty: 3000,  unit: 'L',     urgency: 'high',     status: 'dispatched', reported: '2026-09-09T06:20:00', source: 'whatsapp',  reportedQty: 3000, estimatedNeed: 2800, verificationStep: 6 },
  { id: 'D006', villageId: 'V5', resource: 'food',     qty: 1800,  unit: 'packs', urgency: 'high',     status: 'verified',   reported: '2026-09-09T09:00:00', source: 'app',       reportedQty: 2000, estimatedNeed: 1800, verificationStep: 6 },
  { id: 'D007', villageId: 'V2', resource: 'medicine', qty: 300,   unit: 'units', urgency: 'medium',   status: 'pending',    reported: '2026-09-09T10:15:00', source: 'whatsapp',  reportedQty: 300,  estimatedNeed: 280,  verificationStep: 3 },
  { id: 'D008', villageId: 'V3', resource: 'water',    qty: 2000,  unit: 'L',     urgency: 'medium',   status: 'verified',   reported: '2026-09-09T10:40:00', source: 'dashboard', reportedQty: 2000, estimatedNeed: 2000, verificationStep: 6 },
  { id: 'D009', villageId: 'V4', resource: 'shelter',  qty: 30,    unit: 'kits',  urgency: 'medium',   status: 'pending',    reported: '2026-09-09T11:00:00', source: 'app',       reportedQty: 30,   estimatedNeed: 25,   verificationStep: 2 },
  { id: 'D010', villageId: 'V5', resource: 'water',    qty: 1500,  unit: 'L',     urgency: 'low',      status: 'matched',    reported: '2026-09-09T11:30:00', source: 'whatsapp',  reportedQty: 1500, estimatedNeed: 1400, verificationStep: 6 },
  { id: 'D011', villageId: 'V1', resource: 'food',     qty: 1000,  unit: 'packs', urgency: 'low',      status: 'pending',    reported: '2026-09-09T12:00:00', source: 'app',       reportedQty: 1200, estimatedNeed: 1000, verificationStep: 1 },
  { id: 'D012', villageId: 'V2', resource: 'shelter',  qty: 20,    unit: 'kits',  urgency: 'low',      status: 'verified',   reported: '2026-09-09T12:15:00', source: 'dashboard', reportedQty: 20,   estimatedNeed: 20,   verificationStep: 6 },
];

export const deliveries = [
  { id: 'DEL001', demandId: 'D-PREV-01', villageId: 'V1', resource: 'water',    qty: 3000, unit: 'L',     driver: 'Rafiq Ahmed',   time: '2026-09-08T14:30:00', otp: '4821', gps: { lat: 26.1252, lng: 89.5198 }, photo: true, status: 'confirmed' },
  { id: 'DEL002', demandId: 'D-PREV-02', villageId: 'V2', resource: 'food',     qty: 2000, unit: 'packs', driver: 'Kamal Hossain', time: '2026-09-08T15:10:00', otp: '7392', gps: { lat: 25.8118, lng: 89.6358 }, photo: true, status: 'confirmed' },
  { id: 'DEL003', demandId: 'D-PREV-03', villageId: 'V3', resource: 'medicine', qty: 400,  unit: 'units', driver: 'Nasima Begum',  time: '2026-09-08T16:45:00', otp: '5510', gps: { lat: 25.5528, lng: 89.6808 }, photo: true, status: 'confirmed' },
  { id: 'DEL004', demandId: 'D-PREV-04', villageId: 'V4', resource: 'water',    qty: 2500, unit: 'L',     driver: 'Jamal Uddin',   time: '2026-09-08T17:20:00', otp: '1647', gps: { lat: 25.6312, lng: 89.7662 }, photo: true, status: 'confirmed' },
  { id: 'DEL005', demandId: 'D-PREV-05', villageId: 'V5', resource: 'shelter',  qty: 100,  unit: 'kits',  driver: 'Rafiq Ahmed',   time: '2026-09-09T06:00:00', otp: '8834', gps: { lat: 25.9712, lng: 89.7202 }, photo: true, status: 'confirmed' },
  { id: 'DEL006', demandId: 'D-PREV-06', villageId: 'V1', resource: 'food',     qty: 1500, unit: 'packs', driver: 'Kamal Hossain', time: '2026-09-09T07:30:00', otp: '2956', gps: { lat: 26.1248, lng: 89.5202 }, photo: true, status: 'confirmed' },
  { id: 'DEL007', demandId: 'D-PREV-07', villageId: 'V3', resource: 'water',    qty: 1800, unit: 'L',     driver: 'Nasima Begum',  time: '2026-09-09T08:15:00', otp: '6173', gps: { lat: 25.5532, lng: 89.6812 }, photo: true, status: 'confirmed' },
  { id: 'DEL008', demandId: 'D002',      villageId: 'V2', resource: 'food',     qty: 2500, unit: 'packs', driver: 'Rafiq Ahmed',   time: '2026-09-09T10:00:00', otp: '9041', gps: { lat: 25.8122, lng: 89.6362 }, photo: false, status: 'in-transit' },
];

export const roads = [
  { id: 'R1', from: 'Central Relief Hub', to: 'Sundarganj Camp',    status: 'open',    damage: 'none',    lat: 25.9400, lng: 89.3800, updatedAt: '2026-09-09T09:00:00' },
  { id: 'R2', from: 'NGO Forward Base',   to: 'Kurigram Shelter',   status: 'open',    damage: 'minor',   lat: 25.8800, lng: 89.6330, updatedAt: '2026-09-09T08:30:00' },
  { id: 'R3', from: 'District Depot',     to: 'Chilmari Village',   status: 'blocked', damage: 'flooded', lat: 25.8100, lng: 89.5600, updatedAt: '2026-09-09T10:30:00' },
  { id: 'R4', from: 'Central Relief Hub', to: 'Rowmari Camp',       status: 'blocked', damage: 'damaged', lat: 25.6900, lng: 89.5100, updatedAt: '2026-09-09T09:45:00' },
  { id: 'R5', from: 'District Depot',     to: 'Nageshwari Shelter', status: 'open',    damage: 'minor',   lat: 26.0100, lng: 89.5800, updatedAt: '2026-09-09T07:00:00' },
  { id: 'R6', from: 'NGO Forward Base',   to: 'Rowmari Camp',       status: 'caution', damage: 'minor',   lat: 25.7950, lng: 89.7000, updatedAt: '2026-09-09T10:00:00' },
];

export const verificationSteps = [
  { step: 1, name: 'GPS Validation',        icon: '📍', desc: 'Confirm request origin falls within a known disaster zone' },
  { step: 2, name: 'Duplicate Check',        icon: '🔁', desc: 'Match against existing requests for same village + resource' },
  { step: 3, name: 'Population Cross-check', icon: '👥', desc: 'Compare reported qty against known population data' },
  { step: 4, name: 'Delivery History',       icon: '📦', desc: 'Check if this need was already fulfilled recently' },
  { step: 5, name: 'Satellite/Damage Data',  icon: '🛰️', desc: 'Cross-reference damage severity from satellite imagery' },
  { step: 6, name: 'Officer Sign-off',       icon: '✅', desc: 'Final approval by an authorized officer or volunteer' },
];

export const pipelineStages = [
  { id: 1, name: 'Report',     icon: '📝', short: 'Need Reporting',          desc: '3 channels — App, WhatsApp, Dashboard — all feeding into one structured record.' },
  { id: 2, name: 'Verify',     icon: '🔍', short: 'Verification & Priority', desc: '6-step verification chain with GPS, duplicate, population, history, satellite, and officer checks.' },
  { id: 3, name: 'Prioritize', icon: '⚡', short: 'Priority Engine',         desc: 'Urgency Score = Population × Severity × Time Factor. Sorted Critical → Low.' },
  { id: 4, name: 'Match',      icon: '🎯', short: 'Matching Engine',         desc: "Nearest warehouse isn't always right — checks stock, urgency, capacity, road conditions." },
  { id: 5, name: 'Assign',     icon: '🚚', short: 'Vehicle Assignment',      desc: 'Optimal vehicle based on capacity, proximity, and current load.' },
  { id: 6, name: 'Optimize',   icon: '🗺️', short: 'Route Optimization',      desc: 'OR-Tools optimized multi-stop routes, auto re-planned around blocked roads.' },
  { id: 7, name: 'Track',      icon: '📡', short: 'Live Tracking',           desc: 'Real-time truck positions, road alerts, and instant route recalculation.' },
  { id: 8, name: 'Prove',      icon: '📸', short: 'Delivery Proof',          desc: 'Photo + GPS + OTP confirmation. Not a checkbox — evidence.' },
  { id: 9, name: 'Dashboard',  icon: '📊', short: 'Control Room',            desc: 'One dashboard for the entire response — live counters, map, and alerts.' },
];

export const stats = {
  activeRequests: 12,
  criticalNeeds: 3,
  trucksActive: 2,
  deliveriesCompleted: 8,
  totalPeopleServed: 9120,
  warehousesOnline: 3,
  roadsBlocked: 2,
  avgResponseTime: '2.4 hrs',
};

export const trackingScenario = [
  { time: '10:00', event: 'Truck T1 departs Central Relief Hub',       icon: '🚚', type: 'departure' },
  { time: '10:15', event: 'Truck T1 passes checkpoint Alpha',          icon: '✅', type: 'checkpoint' },
  { time: '10:30', event: 'Road R3 blocked — flooding reported',       icon: '🚧', type: 'alert' },
  { time: '10:31', event: 'OR-Tools recalculates route via alternate',  icon: '🔄', type: 'reroute' },
  { time: '10:32', event: 'Driver receives updated route notification', icon: '📱', type: 'notification' },
  { time: '10:55', event: 'Truck T1 arrives via alternate route',       icon: '📍', type: 'arrival' },
  { time: '11:00', event: 'Delivery confirmed — OTP 4821 verified',    icon: '📸', type: 'delivery' },
];

export const mlTasks = [
  { name: 'Priority Prediction',       icon: '🎯', desc: 'Classifies incoming needs as Critical / High / Medium / Low based on population, severity, time since last delivery, distance, medical flags, and live weather.', features: ['Population', 'Severity', 'Time Since Delivery', 'Distance', 'Medical Flags', 'Weather'], accuracy: '94.2%', model: 'Gradient Boosted Trees' },
  { name: 'Duplicate Detection',       icon: '🔁', desc: 'Flags overlapping requests from the same village for the same resource — e.g. "Village A, Water, 4,000L" and "Village A, Water, 3,500L" merged before dispatch.', features: ['Location Match', 'Resource Match', 'Quantity Similarity', 'Time Proximity', 'Source Channel'], accuracy: '97.8%', model: 'Fuzzy Matching + Cosine Similarity' },
  { name: 'Road Damage Classification', icon: '🛰️', desc: 'Classifies road imagery as Normal / Damaged / Flooded / Blocked. Simulated with sample images for hackathon.', features: ['Satellite Image', 'Drone Footage', 'User Photo', 'Historical Damage', 'Weather Data'], accuracy: '91.5%', model: 'CNN (ResNet-50 fine-tuned)' },
];

export const dataTables = [
  { name: 'users',       columns: ['user_id', 'name', 'role', 'phone', 'location'],                             icon: '👤', records: 142 },
  { name: 'demands',     columns: ['demand_id', 'location', 'resource_type', 'quantity', 'urgency', 'status'],   icon: '📋', records: 89 },
  { name: 'supplies',    columns: ['supply_id', 'organization', 'resource_type', 'quantity', 'available_qty'],   icon: '📦', records: 24 },
  { name: 'vehicles',    columns: ['vehicle_id', 'driver_id', 'capacity', 'current_location', 'status'],        icon: '🚚', records: 12 },
  { name: 'routes',      columns: ['route_id', 'vehicle_id', 'start', 'destination', 'distance', 'eta'],        icon: '🗺️', records: 37 },
  { name: 'road_status', columns: ['road_id', 'location', 'status', 'damage_level', 'updated_at'],              icon: '🛤️', records: 18 },
  { name: 'deliveries',  columns: ['delivery_id', 'demand_id', 'vehicle_id', 'gps', 'proof', 'status'],         icon: '✅', records: 56 },
];

export const routeComparison = {
  naive:     { trips: 3, totalKm: 48.6, trucks: 3, invalidRoutes: 1, description: 'Separate warehouse→destination trips. No awareness of road closures.' },
  optimized: { trips: 1, totalKm: 31.2, trucks: 1, invalidRoutes: 0, description: 'One multi-stop loop, auto-rerouted around blocked roads.' },
};

// ── Helpers ─────────────────────────────────────────────
export const getVillage = (id) => villages.find(v => v.id === id);
export const getWarehouse = (id) => warehouses.find(w => w.id === id);

export const urgencyColor = (u) => ({ critical: '#EF4444', high: '#F97316', medium: '#EAB308', low: '#22C55E' })[u] || '#94A3B8';
export const urgencyBg = (u) => ({ critical: 'rgba(239,68,68,0.15)', high: 'rgba(249,115,22,0.15)', medium: 'rgba(234,179,8,0.15)', low: 'rgba(34,197,94,0.15)' })[u] || 'rgba(148,163,184,0.15)';
export const resourceIcon = (r) => ({ water: '💧', food: '🍚', medicine: '💊', shelter: '⛺' })[r] || '📦';
export const statusColor = (s) => ({ pending: '#94A3B8', verified: '#3B82F6', matched: '#8B5CF6', dispatched: '#F59E0B', delivered: '#10B981', confirmed: '#10B981', 'in-transit': '#F59E0B' })[s] || '#94A3B8';

export const formatTime = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
export const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export const timeAgo = (iso) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};
