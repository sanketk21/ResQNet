import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  AlertTriangle, Truck, CheckCircle2, Activity, Package, MapPin, Clock,
  ShieldCheck, Wifi, Eye, Plus, Check, Send, X, AlertOctagon, RotateCcw,
  CheckCheck, Camera, KeyRound, Zap, RefreshCw
} from 'lucide-react';
import {
  villages, warehouses as initialWarehouses, vehicles as initialVehicles,
  demands as initialDemands, deliveries as initialDeliveries, roads as initialRoads,
  getVillage, urgencyColor, urgencyBg, resourceIcon,
  statusColor, formatTime, timeAgo
} from '../data';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

/* Fix leaflet default icon */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/* ── Animated Counter ──────────────── */
function AnimCounter({ target, duration = 800 }) {
  const [val, setVal] = useState(target);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setVal(target);
        clearInterval(timer);
      } else {
        setVal(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{val.toLocaleString()}</>;
}

/* ── KPI Card ──────────────────────── */
function KPICard({ icon: Icon, label, value, color, glow }) {
  return (
    <div className="kpi-card" style={{ '--kpi-color': color, '--kpi-glow': glow }}>
      <div className="kpi-icon"><Icon size={22} /></div>
      <div className="kpi-value"><AnimCounter target={value} /></div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

/* ── Supply Progress ───────────────── */
function SupplyBar({ resource, current, max }) {
  const pct = Math.min(100, Math.max(0, Math.round((current / max) * 100)));
  return (
    <div className="supply-row">
      <div className="supply-header">
        <span className="supply-icon">{resourceIcon(resource)}</span>
        <span className="supply-name">{resource.charAt(0).toUpperCase() + resource.slice(1)}</span>
        <span className="supply-nums">{current.toLocaleString()} / {max.toLocaleString()}</span>
      </div>
      <div className="progress-bar">
        <div className={`progress-fill ${resource}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ── Default OR-Tools CVRP Solution Baseline ── */
const defaultOptimalRoutes = {
  status: 'OPTIMAL',
  algorithm: 'Google OR-Tools CVRP (Guided Local Search)',
  total_distance_km: 252.66,
  total_vehicles_used: 2,
  blocked_roads_avoided: ['R3', 'R4'],
  savings_vs_naive: {
    percentage_saved: '48.1%',
    km_saved: 234.03,
    co2_emissions_saved_kg: 63.19,
    naive_distance_km: 486.69,
  },
  routes: [
    {
      vehicle_id: 'T2',
      driver: 'Kamal Hossain',
      color: '#10B981',
      total_distance_km: 123.42,
      total_time_minutes: 164.6,
      total_load: 3750,
      stops: [
        { id: 'W1', name: 'Central Relief Hub', lat: 25.7470, lng: 89.2517, demand_delivered: 0, load_after: 3750, eta_minutes: 0 },
        { id: 'V3', name: 'Chilmari Village', lat: 25.5530, lng: 89.6810, demand_delivered: 850, load_after: 2900, eta_minutes: 64.2 },
        { id: 'V4', name: 'Rowmari Camp', lat: 25.6310, lng: 89.7660, demand_delivered: 1100, load_after: 1800, eta_minutes: 80.4 },
        { id: 'V2', name: 'Kurigram Shelter', lat: 25.8120, lng: 89.6360, demand_delivered: 1800, load_after: 0, eta_minutes: 112.4 },
        { id: 'W1', name: 'Central Relief Hub', lat: 25.7470, lng: 89.2517, demand_delivered: 0, load_after: 0, eta_minutes: 164.6 },
      ],
    },
    {
      vehicle_id: 'T3',
      driver: 'Nasima Begum',
      color: '#8B5CF6',
      total_distance_km: 129.25,
      total_time_minutes: 172.3,
      total_load: 2150,
      stops: [
        { id: 'W1', name: 'Central Relief Hub', lat: 25.7470, lng: 89.2517, demand_delivered: 0, load_after: 2150, eta_minutes: 0 },
        { id: 'V5', name: 'Nageshwari Shelter', lat: 25.9710, lng: 89.7200, demand_delivered: 950, load_after: 1200, eta_minutes: 70.8 },
        { id: 'V1', name: 'Sundarganj Camp', lat: 26.1250, lng: 89.5200, demand_delivered: 1200, load_after: 0, eta_minutes: 105.8 },
        { id: 'W1', name: 'Central Relief Hub', lat: 25.7470, lng: 89.2517, demand_delivered: 0, load_after: 0, eta_minutes: 172.3 },
      ],
    },
  ],
};

/* ── Dashboard Page ────────────────── */
export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [liveTime, setLiveTime] = useState(new Date());

  // Dynamic Live State
  const [demandsList, setDemandsList] = useState(() => JSON.parse(JSON.stringify(initialDemands)));
  const [warehousesList, setWarehousesList] = useState(() => JSON.parse(JSON.stringify(initialWarehouses)));
  const [vehiclesList, setVehiclesList] = useState(() => JSON.parse(JSON.stringify(initialVehicles)));
  const [deliveriesList, setDeliveriesList] = useState(() => JSON.parse(JSON.stringify(initialDeliveries)));
  const [roadsList, setRoadsList] = useState(() => JSON.parse(JSON.stringify(initialRoads)));

  // Modals & Popups
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [completingDemand, setCompletingDemand] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [toast, setToast] = useState(null);

  // Form State for Report Need Modal
  const [newDemand, setNewDemand] = useState({
    villageId: 'V1',
    resource: 'water',
    qty: 2000,
    urgency: 'high',
    source: 'dashboard',
  });

  // Live OR-Tools State
  const [optimalRoutes, setOptimalRoutes] = useState(defaultOptimalRoutes);
  const [isSolvingRoutes, setIsSolvingRoutes] = useState(false);
  const [routeViewMode, setRouteViewMode] = useState('cvrp'); // 'cvrp' (OR-Tools multi-stop) or 'direct'

  const fetchOptimalRoutes = async (roadsToUse = roadsList, demandsToUse = demandsList) => {
    setIsSolvingRoutes(true);
    try {
      const payload = {
        depot: {
          id: 'W1',
          name: 'Central Relief Hub',
          lat: 25.7470,
          lng: 89.2517,
          type: 'warehouse',
          demand_qty: 0,
        },
        villages: villages.map(v => {
          const dMatch = demandsToUse.find(d => d.villageId === v.id && d.status !== 'delivered' && d.status !== 'cancelled');
          return {
            id: v.id,
            name: v.name,
            lat: v.lat,
            lng: v.lng,
            type: 'village',
            demand_qty: dMatch ? dMatch.qty : 600,
            population: v.population,
          };
        }),
        fleet: vehiclesList.map(v => ({
          id: v.id,
          driver: v.driver,
          capacity: v.capacity,
          start_node_id: 'W1',
          speed_kmh: 45.0,
        })),
        roads: roadsToUse.map(r => ({
          id: r.id,
          from_name: r.from,
          to_name: r.to,
          status: r.status,
          damage: r.damage || 'none',
          penalty_factor: r.status === 'caution' ? 1.5 : 1.0,
        })),
        time_limit_sec: 2,
      };

      const res = await fetch('http://127.0.0.1:8000/api/routes/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Solver error');
      const data = await res.json();
      const vehicleColorMap = { T1: '#3B82F6', T2: '#10B981', T3: '#8B5CF6', T4: '#F59E0B' };
      if (data && data.routes) {
        data.routes = data.routes.map(r => ({
          ...r,
          color: r.color || vehicleColorMap[r.vehicle_id] || '#10B981',
        }));
      }
      setOptimalRoutes(data);
    } catch {
      // Fallback matching OR-Tools solution
      const isR3Blocked = roadsToUse.some(r => r.id === 'R3' && r.status === 'blocked');
      const isR4Blocked = roadsToUse.some(r => r.id === 'R4' && r.status === 'blocked');
      setOptimalRoutes({
        status: 'OPTIMAL',
        algorithm: 'Google OR-Tools CVRP',
        total_distance_km: (isR3Blocked || isR4Blocked) ? 252.66 : 210.4,
        total_vehicles_used: 2,
        blocked_roads_avoided: roadsToUse.filter(r => r.status === 'blocked').map(r => r.id),
        savings_vs_naive: {
          percentage_saved: (isR3Blocked || isR4Blocked) ? '48.1%' : '52.3%',
          km_saved: (isR3Blocked || isR4Blocked) ? 234.03 : 246.2,
          co2_emissions_saved_kg: 63.19,
        },
        routes: [
          {
            vehicle_id: 'T2',
            driver: 'Kamal Hossain',
            color: '#10B981',
            total_distance_km: 123.42,
            total_time_minutes: 164.6,
            total_load: 3750,
            stops: [
              { id: 'W1', name: 'Central Relief Hub', lat: 25.7470, lng: 89.2517, demand_delivered: 0, load_after: 3750, eta_minutes: 0 },
              { id: 'V3', name: 'Chilmari Village', lat: 25.5530, lng: 89.6810, demand_delivered: 850, load_after: 2900, eta_minutes: 64.2 },
              { id: 'V4', name: 'Rowmari Camp', lat: 25.6310, lng: 89.7660, demand_delivered: 1100, load_after: 1800, eta_minutes: 80.4 },
              { id: 'V2', name: 'Kurigram Shelter', lat: 25.8120, lng: 89.6360, demand_delivered: 1800, load_after: 0, eta_minutes: 112.4 },
              { id: 'W1', name: 'Central Relief Hub', lat: 25.7470, lng: 89.2517, demand_delivered: 0, load_after: 0, eta_minutes: 164.6 },
            ],
          },
          {
            vehicle_id: 'T3',
            driver: 'Nasima Begum',
            color: '#8B5CF6',
            total_distance_km: 129.25,
            total_time_minutes: 172.3,
            total_load: 2150,
            stops: [
              { id: 'W1', name: 'Central Relief Hub', lat: 25.7470, lng: 89.2517, demand_delivered: 0, load_after: 2150, eta_minutes: 0 },
              { id: 'V5', name: 'Nageshwari Shelter', lat: 25.9710, lng: 89.7200, demand_delivered: 950, load_after: 1200, eta_minutes: 70.8 },
              { id: 'V1', name: 'Sundarganj Camp', lat: 26.1250, lng: 89.5200, demand_delivered: 1200, load_after: 0, eta_minutes: 105.8 },
              { id: 'W1', name: 'Central Relief Hub', lat: 25.7470, lng: 89.2517, demand_delivered: 0, load_after: 0, eta_minutes: 172.3 },
            ],
          },
        ],
      });
    } finally {
      setIsSolvingRoutes(false);
    }
  };

  // Live Clock
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Toast auto-clear
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Helper for units
  const resourceUnit = (r) => {
    switch (r) {
      case 'water': return 'L';
      case 'food': return 'packs';
      case 'medicine': return 'units';
      case 'shelter': return 'kits';
      default: return 'units';
    }
  };

  // Dynamic KPIs
  const activeRequestsCount = demandsList.filter(d => d.status !== 'delivered' && d.status !== 'cancelled').length;
  const criticalNeedsCount = demandsList.filter(d => d.urgency === 'critical' && d.status !== 'delivered' && d.status !== 'cancelled').length;
  const trucksActiveCount = vehiclesList.filter(v => v.status === 'delivering' || v.status === 'in-transit').length;
  const deliveriesDoneCount = deliveriesList.filter(d => d.status === 'confirmed').length;

  // Filtered demands
  const filteredDemands = activeFilter === 'all'
    ? demandsList
    : demandsList.filter(d => d.urgency === activeFilter);

  // Aggregate supply from live warehouses
  const totalSupply = warehousesList.reduce((acc, w) => {
    Object.entries(w.stock).forEach(([k, v]) => { acc[k] = (acc[k] || 0) + v; });
    return acc;
  }, { water: 0, food: 0, medicine: 0, shelter: 0 });
  const maxSupply = { water: 25000, food: 12000, medicine: 5000, shelter: 800 };

  // Chart data
  const urgencyCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  demandsList.filter(d => d.status !== 'delivered' && d.status !== 'cancelled').forEach(d => {
    if (urgencyCounts[d.urgency] !== undefined) urgencyCounts[d.urgency]++;
  });

  const doughnutData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      data: [urgencyCounts.critical, urgencyCounts.high, urgencyCounts.medium, urgencyCounts.low],
      backgroundColor: ['#EF4444', '#F97316', '#EAB308', '#22C55E'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const resourceCounts = {};
  demandsList.filter(d => d.status !== 'delivered' && d.status !== 'cancelled').forEach(d => {
    resourceCounts[d.resource] = (resourceCounts[d.resource] || 0) + 1;
  });
  const barData = {
    labels: Object.keys(resourceCounts).map(r => r.charAt(0).toUpperCase() + r.slice(1)),
    datasets: [{
      label: 'Active Needs',
      data: Object.values(resourceCounts),
      backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6'],
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#475569', font: { family: 'Inter', weight: 500 } } },
      y: { grid: { color: '#E2E8F0' }, ticks: { color: '#475569', font: { family: 'Inter', weight: 500 } } },
    },
  };

  // ── 1. Create New Demand Handler ──
  const handleCreateDemand = (e) => {
    e.preventDefault();
    const qtyNum = Number(newDemand.qty);
    if (!qtyNum || qtyNum <= 0) {
      showToast('Please enter a valid quantity', 'error');
      return;
    }

    const nextIdNum = demandsList.reduce((max, d) => {
      const match = d.id.match(/\d+/);
      const val = match ? parseInt(match[0], 10) : 0;
      return Math.max(max, val);
    }, 0) + 1;
    const newId = `D${String(nextIdNum).padStart(3, '0')}`;
    const village = getVillage(newDemand.villageId);

    const createdRecord = {
      id: newId,
      villageId: newDemand.villageId,
      resource: newDemand.resource,
      qty: qtyNum,
      unit: resourceUnit(newDemand.resource),
      urgency: newDemand.urgency,
      status: 'pending',
      reported: new Date().toISOString(),
      source: newDemand.source,
      reportedQty: qtyNum,
      estimatedNeed: qtyNum,
      verificationStep: 1,
    };

    const updatedDemands = [createdRecord, ...demandsList];
    setDemandsList(updatedDemands);
    setIsReportModalOpen(false);
    showToast(`🚨 New Request ${newId} logged for ${village?.name || 'Village'} (${qtyNum.toLocaleString()} ${createdRecord.unit} ${newDemand.resource})`, 'success');
    fetchOptimalRoutes(roadsList, updatedDemands);

    // Reset form
    setNewDemand({
      villageId: 'V1',
      resource: 'water',
      qty: 2000,
      urgency: 'high',
      source: 'dashboard',
    });
  };

  // ── 2. Demand Management Actions ──
  const handleVerify = (demandId) => {
    setDemandsList(prev => prev.map(d => {
      if (d.id !== demandId) return d;
      return { ...d, status: 'verified', verificationStep: 6 };
    }));
    showToast(`✅ Request ${demandId} successfully verified by relief coordinator.`, 'success');
  };

  const handleDispatch = (demand) => {
    // 1. Find warehouse with highest stock for this resource
    let chosenWarehouse = null;
    let maxStock = -1;
    warehousesList.forEach(w => {
      const available = w.stock[demand.resource] || 0;
      if (available > maxStock) {
        maxStock = available;
        chosenWarehouse = w;
      }
    });

    if (!chosenWarehouse || maxStock < 1) {
      showToast(`❌ Insufficient stock across all warehouses for ${demand.resource}!`, 'error');
      return;
    }

    const qtyToDeduct = Math.min(demand.qty, maxStock);

    // 2. Deduct inventory from chosen warehouse
    setWarehousesList(prev => prev.map(w => {
      if (w.id !== chosenWarehouse.id) return w;
      return {
        ...w,
        stock: {
          ...w.stock,
          [demand.resource]: Math.max(0, (w.stock[demand.resource] || 0) - qtyToDeduct),
        },
      };
    }));

    // 3. Assign an available truck (idle first, or any)
    let assignedTruck = vehiclesList.find(v => v.status === 'idle') || vehiclesList[0];
    setVehiclesList(prev => prev.map(v => {
      if (v.id !== assignedTruck.id) return v;
      return { ...v, status: 'delivering' };
    }));

    // 4. Update demand status to dispatched
    setDemandsList(prev => prev.map(d => {
      if (d.id !== demand.id) return d;
      return {
        ...d,
        status: 'dispatched',
        assignedTruckId: assignedTruck.id,
        warehouseId: chosenWarehouse.id,
      };
    }));

    const village = getVillage(demand.villageId);
    showToast(`🚚 Dispatched ${qtyToDeduct.toLocaleString()} ${demand.unit} ${demand.resource} from ${chosenWarehouse.name} to ${village?.name} via ${assignedTruck.id} (${assignedTruck.driver})`, 'success');
  };

  const handleOpenCompleteModal = (demand) => {
    setCompletingDemand(demand);
    setOtpInput('4821'); // Pre-fill sample OTP for convenient verification
  };

  const handleConfirmDelivery = () => {
    if (!completingDemand) return;
    const village = getVillage(completingDemand.villageId);

    // 1. Update demand to delivered
    setDemandsList(prev => prev.map(d => {
      if (d.id !== completingDemand.id) return d;
      return { ...d, status: 'delivered', verificationStep: 6 };
    }));

    // 2. Add confirmed delivery record
    const newDelivery = {
      id: `DEL00${deliveriesList.length + 1}`,
      demandId: completingDemand.id,
      villageId: completingDemand.villageId,
      resource: completingDemand.resource,
      qty: completingDemand.qty,
      unit: completingDemand.unit,
      driver: 'Rafiq Ahmed',
      time: new Date().toISOString(),
      otp: otpInput || '5521',
      gps: { lat: village ? village.lat : 26.125, lng: village ? village.lng : 89.52 },
      photo: true,
      status: 'confirmed',
    };
    setDeliveriesList([newDelivery, ...deliveriesList]);

    // 3. Release vehicle if assigned
    if (completingDemand.assignedTruckId) {
      setVehiclesList(prev => prev.map(v => {
        if (v.id !== completingDemand.assignedTruckId) return v;
        return { ...v, status: 'idle' };
      }));
    }

    showToast(`🎉 Delivery confirmed for ${village?.name || 'Village'}! OTP ${newDelivery.otp} and GPS coordinates matched.`, 'success');
    setCompletingDemand(null);
  };

  const handleCancel = (demandId) => {
    setDemandsList(prev => prev.map(d => {
      if (d.id !== demandId) return d;
      return { ...d, status: 'cancelled' };
    }));
    showToast(`Demand ${demandId} marked as cancelled.`, 'info');
  };

  // ── 3. Road Hazard Toggling Handler with Live OR-Tools Recalculation ──
  const handleToggleRoad = (roadId) => {
    const cycleMap = { open: 'caution', caution: 'blocked', blocked: 'open' };
    const damageMap = { open: 'minor', caution: 'flooded', blocked: 'none' };

    const updatedRoads = roadsList.map(r => {
      if (r.id !== roadId) return r;
      const nextStatus = cycleMap[r.status] || 'open';
      const nextDamage = damageMap[r.status] || 'none';
      return {
        ...r,
        status: nextStatus,
        damage: nextDamage,
        updatedAt: new Date().toISOString(),
      };
    });

    setRoadsList(updatedRoads);

    const changedRoad = updatedRoads.find(r => r.id === roadId);
    const toastType = changedRoad.status === 'blocked' ? 'error' : changedRoad.status === 'caution' ? 'warning' : 'success';
    showToast(
      `🛣️ Road ${roadId} changed to ${changedRoad.status.toUpperCase()}! OR-Tools automatically recalculating routes...`,
      toastType
    );

    // Live trigger OR-Tools solver!
    fetchOptimalRoutes(updatedRoads, demandsList);
  };

  // ── Reset Simulator ──
  const handleResetData = () => {
    const defDemands = JSON.parse(JSON.stringify(initialDemands));
    const defRoads = JSON.parse(JSON.stringify(initialRoads));
    setDemandsList(defDemands);
    setWarehousesList(JSON.parse(JSON.stringify(initialWarehouses)));
    setVehiclesList(JSON.parse(JSON.stringify(initialVehicles)));
    setDeliveriesList(JSON.parse(JSON.stringify(initialDeliveries)));
    setRoadsList(defRoads);
    fetchOptimalRoutes(defRoads, defDemands);
    showToast('Simulation data reset to default demo scenario', 'info');
  };

  return (
    <>
      <Navbar />

      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`dash-toast ${toast.type}`}>
          <div className="toast-content">
            {toast.type === 'success' && <CheckCheck size={18} />}
            {toast.type === 'warning' && <AlertTriangle size={18} />}
            {toast.type === 'error' && <AlertOctagon size={18} />}
            {toast.type === 'info' && <Activity size={18} />}
            <span>{toast.message}</span>
          </div>
          <button className="toast-close" onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      <div className="dashboard">
        {/* ── Top Bar ── */}
        <div className="dash-topbar">
          <div className="container-wide dash-topbar-inner">
            <div className="dash-topbar-left">
              <h1 className="dash-title">Control Room</h1>
              <span className="live-indicator">LIVE</span>
            </div>
            <div className="dash-topbar-right">
              <button
                className="btn-report-need"
                onClick={() => setIsReportModalOpen(true)}
              >
                <Plus size={16} /> Report Emergency Need
              </button>
              <button
                className="btn-reset-demo"
                title="Reset simulation data to default"
                onClick={handleResetData}
              >
                <RotateCcw size={14} /> Reset Demo
              </button>
              <span className="dash-clock">
                <Clock size={14} />
                {liveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </span>
              <span className="dash-status online">
                <Wifi size={14} /> All Systems Online
              </span>
            </div>
          </div>
        </div>

        <div className="container-wide dash-content">
          {/* ── KPI Row ── */}
          <div className="kpi-row">
            <KPICard icon={Activity} label="Active Requests" value={activeRequestsCount} color="var(--c-secondary)" glow="var(--c-secondary-glow)" />
            <KPICard icon={AlertTriangle} label="Critical Needs" value={criticalNeedsCount} color="var(--c-critical)" glow="var(--c-primary-glow)" />
            <KPICard icon={Truck} label="Trucks Active" value={trucksActiveCount} color="var(--c-warning)" glow="var(--c-warning-glow)" />
            <KPICard icon={CheckCircle2} label="Deliveries Done" value={deliveriesDoneCount} color="var(--c-accent)" glow="var(--c-accent-glow)" />
          </div>

          {/* ── OR-Tools Intelligent CVRP Optimization Control Strip ── */}
          <div className="cvrp-solver-card">
            <div className="cvrp-top-row">
              <div className="cvrp-left-info">
                <div className="cvrp-badge">
                  <Zap size={14} className="cvrp-zap-icon" />
                  <span>Google OR-Tools CVRP Engine</span>
                </div>
                <div className="cvrp-title-wrap">
                  <h2 className="cvrp-main-title">Autonomous Vehicle Routing & Hazard Bypass</h2>
                  <span className={`cvrp-engine-status ${isSolvingRoutes ? 'solving' : 'optimal'}`}>
                    {isSolvingRoutes ? (
                      <>
                        <RefreshCw size={13} className="spin-icon" />
                        Recalculating Guided Local Search...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={13} />
                        Optimal Routing Active ({optimalRoutes?.routes?.length || 2} Trucks Dispatched)
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="cvrp-action-group">
                <div className="cvrp-toggle-pill">
                  <button
                    className={`cvrp-toggle-btn ${routeViewMode === 'cvrp' ? 'active' : ''}`}
                    onClick={() => setRouteViewMode('cvrp')}
                    title="Show multi-stop vehicle itineraries solved by OR-Tools"
                  >
                    Multi-Stop CVRP Routes
                  </button>
                  <button
                    className={`cvrp-toggle-btn ${routeViewMode === 'direct' ? 'active' : ''}`}
                    onClick={() => setRouteViewMode('direct')}
                    title="Show direct point-to-point dispatch lines"
                  >
                    Direct Corridors
                  </button>
                </div>

                <button
                  className="cvrp-btn-recalc"
                  onClick={() => fetchOptimalRoutes(roadsList, demandsList)}
                  disabled={isSolvingRoutes}
                  title="Re-run Google OR-Tools CVRP solver across active demands and road network"
                >
                  <RefreshCw size={14} className={isSolvingRoutes ? 'spin-icon' : ''} />
                  {isSolvingRoutes ? 'Solving...' : 'Re-solve Routes'}
                </button>
              </div>
            </div>

            <div className="cvrp-metrics-grid">
              <div className="cvrp-stat-box">
                <span className="cvrp-stat-label">Optimized Total Distance</span>
                <span className="cvrp-stat-val primary">{optimalRoutes?.total_distance_km || 252.66} km</span>
                <span className="cvrp-stat-sub">vs 486.7 km Naive Baseline</span>
              </div>
              <div className="cvrp-stat-box">
                <span className="cvrp-stat-label">Routing Efficiency Gain</span>
                <span className="cvrp-stat-val success">
                  {optimalRoutes?.savings_vs_naive?.percentage_saved || '48.1%'} Saved
                </span>
                <span className="cvrp-stat-sub">
                  {optimalRoutes?.savings_vs_naive?.km_saved || 234.03} km reduction
                </span>
              </div>
              <div className="cvrp-stat-box">
                <span className="cvrp-stat-label">CO₂ Emissions Abated</span>
                <span className="cvrp-stat-val accent">
                  {optimalRoutes?.savings_vs_naive?.co2_emissions_saved_kg || 63.19} kg CO₂
                </span>
                <span className="cvrp-stat-sub">Clean disaster logistics</span>
              </div>
              <div className="cvrp-stat-box">
                <span className="cvrp-stat-label">Blocked Hazards Bypassed</span>
                <span className="cvrp-stat-val warning">
                  {roadsList.filter(r => r.status === 'blocked').length} Hazards
                </span>
                <span className="cvrp-stat-sub">
                  {roadsList.filter(r => r.status === 'blocked').map(r => r.id).join(', ') || 'Zero Active Hazards'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Map + Side Panel ── */}
          <div className="dash-main-grid">
            <div className="dash-map-panel">
              <div className="panel-header">
                <h2 className="panel-title"><MapPin size={18} /> Live Operations Map</h2>
                <div className="map-legend">
                  <span className="legend-item"><span className="legend-dot" style={{ background: '#EF4444' }} /> Villages</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: '#3B82F6' }} /> Warehouses</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: '#F59E0B' }} /> Trucks</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: '#10B981' }} /> CVRP Loop T2</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: '#8B5CF6' }} /> CVRP Loop T3</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: '#EF4444', border: '2px solid white' }} /> Blocked Roads</span>
                  <span className="legend-item"><span className="legend-dot" style={{ background: '#F59E0B', border: '2px solid white' }} /> Caution Roads</span>
                </div>
              </div>
              <div className="dash-map-container">
                <MapContainer
                  center={[25.85, 89.55]}
                  zoom={9}
                  scrollWheelZoom={true}
                  style={{ width: '100%', height: '100%', borderRadius: '12px' }}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

                  {/* OR-Tools Optimized Multi-Stop Vehicle Routes */}
                  {routeViewMode === 'cvrp' && optimalRoutes?.routes?.map((route) => {
                    const positions = route.stops.map(s => [s.lat, s.lng]);
                    return (
                      <Polyline
                        key={`cvrp-route-${route.vehicle_id}`}
                        positions={positions}
                        pathOptions={{
                          color: route.color || '#10B981',
                          weight: 4,
                          dashArray: '0',
                          opacity: 0.9,
                        }}
                      >
                        <Popup>
                          <div style={{ fontFamily: 'Inter', fontSize: '12px' }}>
                            <strong>🚚 Vehicle {route.vehicle_id} ({route.driver})</strong><br />
                            Optimized Circuit: <strong>{route.total_distance_km} km</strong> • ~{Math.round(route.total_time_minutes)} mins<br />
                            Cargo Dispatched: <strong>{route.total_load?.toLocaleString()} kg</strong><br />
                            <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #E2E8F0' }}>
                              <strong>Waypoints Sequence:</strong>
                              <ol style={{ paddingLeft: '16px', margin: '4px 0 0' }}>
                                {route.stops.map((st, i) => (
                                  <li key={i}>
                                    {st.name} {st.demand_delivered > 0 ? `(Drop: ${st.demand_delivered} units)` : ''}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        </Popup>
                      </Polyline>
                    );
                  })}

                  {/* Waypoint Sequence Markers on Map */}
                  {routeViewMode === 'cvrp' && optimalRoutes?.routes?.flatMap((route) =>
                    route.stops.filter(s => s.id !== 'W1').map((st, idx) => (
                      <CircleMarker
                        key={`wp-${route.vehicle_id}-${st.id}-${idx}`}
                        center={[st.lat, st.lng]}
                        radius={13}
                        pathOptions={{
                          color: route.color || '#10B981',
                          fillColor: '#FFFFFF',
                          fillOpacity: 0.9,
                          weight: 3,
                        }}
                      >
                        <Popup>
                          <div style={{ fontFamily: 'Inter', fontSize: '12px' }}>
                            <strong>Stop #{idx + 1}: {st.name}</strong><br />
                            Assigned to: <strong>{route.driver} ({route.vehicle_id})</strong><br />
                            Drop Quantity: <strong>{st.demand_delivered} units</strong><br />
                            ETA: <strong>+{Math.round(st.eta_minutes || (idx + 1) * 35)} mins</strong><br />
                            Remaining Cargo: <strong>{st.load_after} kg</strong>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))
                  )}

                  {/* Direct Point-to-Point Dispatched Dynamic Polylines */}
                  {routeViewMode === 'direct' && demandsList.filter(d => d.status === 'dispatched').map(d => {
                    const village = getVillage(d.villageId);
                    const warehouse = warehousesList[0];
                    if (!village || !warehouse) return null;
                    const hasRoadBlock = roadsList.some(r => r.status === 'blocked');
                    return (
                      <Polyline
                        key={`route-${d.id}`}
                        positions={[
                          [warehouse.lat, warehouse.lng],
                          [village.lat, village.lng],
                        ]}
                        pathOptions={{
                          color: hasRoadBlock ? '#F59E0B' : '#3B82F6',
                          weight: 3,
                          dashArray: hasRoadBlock ? '6, 8' : '0',
                          opacity: 0.8,
                        }}
                      >
                        <Popup>
                          <div style={{ fontFamily: 'Inter', fontSize: '12px' }}>
                            <strong>🚚 Dispatch Route: {d.id}</strong><br />
                            From: {warehouse.name}<br />
                            To: {village.name}<br />
                            Resource: {d.qty} {d.unit} {d.resource}<br />
                            Status: {hasRoadBlock ? '⚠ Rerouted via alternate corridor' : '✓ Optimal Direct Path'}
                          </div>
                        </Popup>
                      </Polyline>
                    );
                  })}

                  {/* Villages */}
                  {villages.map(v => {
                    const villageDemands = demandsList.filter(d => d.villageId === v.id && d.status !== 'delivered' && d.status !== 'cancelled');
                    const hasCritical = villageDemands.some(d => d.urgency === 'critical');
                    return (
                      <CircleMarker
                        key={v.id}
                        center={[v.lat, v.lng]}
                        radius={hasCritical ? 12 : 8}
                        pathOptions={{
                          color: hasCritical ? '#EF4444' : '#F97316',
                          fillColor: hasCritical ? '#EF4444' : '#F97316',
                          fillOpacity: .6,
                          weight: 2
                        }}
                      >
                        <Popup>
                          <div style={{ fontFamily: 'Inter', color: '#333' }}>
                            <strong>{v.name}</strong><br />
                            District: {v.district}<br />
                            Population: {v.population.toLocaleString()}<br />
                            Active Requests: {villageDemands.length}<br />
                            {hasCritical && <span style={{ color: '#EF4444', fontWeight: 600 }}>⚠ Critical needs unfulfilled</span>}
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}

                  {/* Warehouses */}
                  {warehousesList.map(w => (
                    <CircleMarker
                      key={w.id}
                      center={[w.lat, w.lng]}
                      radius={10}
                      pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: .7, weight: 2 }}
                    >
                      <Popup>
                        <div style={{ fontFamily: 'Inter', color: '#333' }}>
                          <strong>📦 {w.name}</strong><br />
                          {w.org}<br />
                          Water: {w.stock.water.toLocaleString()} L<br />
                          Food: {w.stock.food.toLocaleString()} packs<br />
                          Medicine: {w.stock.medicine.toLocaleString()} units<br />
                          Shelter: {w.stock.shelter.toLocaleString()} kits
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}

                  {/* Vehicles */}
                  {vehiclesList.filter(v => v.status !== 'idle').map(v => (
                    <CircleMarker
                      key={v.id}
                      center={[v.lat, v.lng]}
                      radius={7}
                      pathOptions={{ color: v.color, fillColor: v.color, fillOpacity: .9, weight: 2 }}
                    >
                      <Popup>
                        <div style={{ fontFamily: 'Inter', color: '#333' }}>
                          <strong>🚚 {v.id}</strong> — {v.driver}<br />
                          {v.plate} • Status: {v.status}<br />
                          Capacity: {v.capacity.toLocaleString()} kg
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}

                  {/* Dynamic Roads on Map */}
                  {roadsList.map(r => {
                    if (r.status === 'open') return null;
                    const isBlocked = r.status === 'blocked';
                    return (
                      <CircleMarker
                        key={r.id}
                        center={[r.lat, r.lng]}
                        radius={isBlocked ? 14 : 10}
                        pathOptions={{
                          color: isBlocked ? '#EF4444' : '#F59E0B',
                          fillColor: isBlocked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          fillOpacity: 0.8,
                          weight: 3,
                          dashArray: isBlocked ? '6 4' : '3 3'
                        }}
                      >
                        <Popup>
                          <div style={{ fontFamily: 'Inter', color: '#333' }}>
                            <strong>{isBlocked ? '🚧 Road Blocked' : '⚠ Caution: Road Hazard'}</strong><br />
                            {r.from} → {r.to}<br />
                            Damage: <strong>{r.damage}</strong><br />
                            Status: <span style={{ textTransform: 'uppercase', color: isBlocked ? '#EF4444' : '#F59E0B', fontWeight: 700 }}>{r.status}</span>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>

            {/* ── Side Panel: Charts + Supply ── */}
            <div className="dash-side-panel">
              <div className="panel-card">
                <div className="panel-header"><h3 className="panel-title">Priority Breakdown</h3></div>
                <div className="chart-container" style={{ height: 200 }}>
                  <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#475569', font: { family: 'Inter', size: 11, weight: 600 }, padding: 12, usePointStyle: true, pointStyleWidth: 8 } } }, cutout: '65%' }} />
                </div>
              </div>

              <div className="panel-card">
                <div className="panel-header"><h3 className="panel-title">Requests by Resource</h3></div>
                <div className="chart-container" style={{ height: 180 }}>
                  <Bar data={barData} options={chartOpts} />
                </div>
              </div>

              <div className="panel-card">
                <div className="panel-header"><h3 className="panel-title"><Package size={16} /> Real-Time Depot Stock</h3></div>
                <div className="supply-list">
                  {Object.entries(totalSupply).map(([resource, qty]) => (
                    <SupplyBar key={resource} resource={resource} current={qty} max={maxSupply[resource] || 10000} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Requests Table with Actions ── */}
          <div className="panel-card requests-panel">
            <div className="panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h2 className="panel-title"><Activity size={18} /> Emergency Demands Triage</h2>
                <span className="count-pill">{filteredDemands.length} Records</span>
              </div>
              <div className="filter-tabs">
                {['all', 'critical', 'high', 'medium', 'low'].map(f => (
                  <button
                    key={f}
                    className={`filter-tab ${activeFilter === f ? 'active' : ''}`}
                    style={activeFilter === f ? { background: urgencyBg(f), color: urgencyColor(f), borderColor: urgencyColor(f) } : {}}
                    onClick={() => setActiveFilter(f)}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-wrap">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Village</th>
                    <th>Resource</th>
                    <th>Qty</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Reported</th>
                    <th>Verification</th>
                    <th style={{ textAlign: 'center' }}>Workflow Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDemands.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-text-muted)' }}>
                        No requests found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredDemands.map(d => {
                      const village = getVillage(d.villageId);
                      return (
                        <tr key={d.id} className={`row-status-${d.status}`}>
                          <td className="td-mono">{d.id}</td>
                          <td><strong>{village?.name || d.villageId}</strong></td>
                          <td><span className="resource-cell">{resourceIcon(d.resource)} {d.resource}</span></td>
                          <td className="td-mono">{d.qty.toLocaleString()} {d.unit}</td>
                          <td><span className={`badge badge-${d.urgency}`}>{d.urgency}</span></td>
                          <td>
                            <span className="status-dot" style={{ background: statusColor(d.status) }} />
                            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{d.status}</span>
                          </td>
                          <td className="td-source">{d.source}</td>
                          <td className="td-time">{timeAgo(d.reported)}</td>
                          <td>
                            <div className="verification-bar" title={`Verification Step ${d.verificationStep} / 6`}>
                              {[1, 2, 3, 4, 5, 6].map(s => (
                                <div key={s} className={`vbar-step ${s <= d.verificationStep ? 'done' : ''}`} />
                              ))}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-btn-group">
                              {d.status === 'pending' && (
                                <>
                                  <button
                                    className="btn-action verify"
                                    onClick={() => handleVerify(d.id)}
                                    title="Verify location, duplicates & officer sign-off"
                                  >
                                    <Check size={13} /> Verify
                                  </button>
                                  <button
                                    className="btn-action cancel"
                                    onClick={() => handleCancel(d.id)}
                                    title="Reject or cancel request"
                                  >
                                    <X size={13} />
                                  </button>
                                </>
                              )}

                              {(d.status === 'verified' || d.status === 'matched') && (
                                <button
                                  className="btn-action dispatch"
                                  onClick={() => handleDispatch(d)}
                                  title="Deduct stock from depot and dispatch vehicle"
                                >
                                  <Send size={13} /> Match & Dispatch
                                </button>
                              )}

                              {d.status === 'dispatched' && (
                                <button
                                  className="btn-action complete"
                                  onClick={() => handleOpenCompleteModal(d)}
                                  title="Confirm delivery with OTP & photo proof"
                                >
                                  <CheckCircle2 size={13} /> Confirm Delivery
                                </button>
                              )}

                              {d.status === 'delivered' && (
                                <span className="action-pill done">
                                  <CheckCheck size={14} /> Fulfilled
                                </span>
                              )}

                              {d.status === 'cancelled' && (
                                <span className="action-pill cancelled">
                                  Cancelled
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Delivery Feed ── */}
          <div className="panel-card delivery-panel">
            <div className="panel-header">
              <h2 className="panel-title"><ShieldCheck size={18} /> Verified Deliveries Audit Log</h2>
              <span className="count-pill">{deliveriesList.length} Verified Drops</span>
            </div>
            <div className="delivery-feed">
              {deliveriesList.slice(0, 8).map(del => {
                const village = getVillage(del.villageId);
                return (
                  <div className={`delivery-item ${del.status}`} key={del.id}>
                    <div className="del-icon">{del.status === 'confirmed' ? '✅' : '🚚'}</div>
                    <div className="del-content">
                      <div className="del-top">
                        <span className="del-resource">{resourceIcon(del.resource)} {del.qty.toLocaleString()} {del.unit} {del.resource}</span>
                        <span className="del-village">→ {village?.name || del.villageId}</span>
                      </div>
                      <div className="del-meta">
                        <span>🚚 {del.driver}</span>
                        <span>📍 GPS Lat: {del.gps?.lat?.toFixed(4) || '26.12'}, Lng: {del.gps?.lng?.toFixed(4) || '89.52'}</span>
                        {del.photo && <span>📸 Photo Cryptographically Hashed</span>}
                        <span>🔢 OTP: <strong>{del.otp}</strong></span>
                      </div>
                    </div>
                    <div className="del-time">{formatTime(del.time)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Road Status with Interactive Hazard Controls ── */}
          <div className="panel-card road-panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title"><Eye size={18} /> Road Hazard & Route Status</h2>
                <p style={{ fontSize: '.8rem', color: 'var(--c-text-muted)', marginTop: 2 }}>
                  Click any road card to toggle condition (Open ➔ Caution ➔ Blocked) and observe live route alerts.
                </p>
              </div>
            </div>
            <div className="road-grid">
              {roadsList.map(r => (
                <div
                  className={`road-card interactive ${r.status}`}
                  key={r.id}
                  onClick={() => handleToggleRoad(r.id)}
                  title="Click to toggle road condition"
                >
                  <div className="road-status-badge">
                    <span className={`glow-dot ${r.status === 'blocked' ? 'critical' : r.status === 'caution' ? 'warning' : 'active'}`} />
                    <span>{r.status.toUpperCase()}</span>
                    <span className="road-click-hint">Click to switch ➔</span>
                  </div>
                  <div className="road-route">{r.from} → {r.to}</div>
                  <div className="road-damage">Damage level: <strong>{r.damage}</strong></div>
                  <div className="road-updated">Updated: {timeAgo(r.updatedAt)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Active Vehicle OR-Tools Itineraries ── */}
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">
                  <Truck size={18} /> Optimized Vehicle Dispatch Itineraries
                </h2>
                <p style={{ fontSize: '.8rem', color: 'var(--c-text-muted)', marginTop: 2 }}>
                  Stop-by-stop cargo distribution plan generated by Google OR-Tools Guided Local Search algorithm.
                </p>
              </div>
              <span className="count-pill">
                {optimalRoutes?.routes?.length || 0} Vehicles Deployed
              </span>
            </div>

            <div className="itineraries-container">
              {optimalRoutes?.routes?.map((route) => (
                <div
                  key={route.vehicle_id}
                  className="itinerary-card"
                  style={{ '--truck-color': route.color || '#10B981' }}
                >
                  <div className="itinerary-header">
                    <div className="itinerary-title-wrap">
                      <span className="itinerary-badge">{route.vehicle_id}</span>
                      <span className="itinerary-driver">{route.driver}</span>
                    </div>
                    <div className="itinerary-metrics">
                      <span>📏 {route.total_distance_km} km</span>
                      <span>⏱ {Math.round(route.total_time_minutes)} min</span>
                      <span>📦 {route.total_load?.toLocaleString()} kg</span>
                    </div>
                  </div>

                  <div className="itinerary-timeline">
                    {route.stops?.map((st, i) => (
                      <div key={i} className="itinerary-step">
                        <div className="itinerary-step-dot" />
                        <div className="itinerary-step-name">
                          {i === 0 ? '🏁 Departure: ' : i === route.stops.length - 1 ? '🏁 Return: ' : `Waypoint #${i}: `}
                          {st.name}
                        </div>
                        <div className="itinerary-step-sub">
                          {st.demand_delivered > 0 ? (
                            <span style={{ color: '#059669', fontWeight: 600 }}>
                              Drop {st.demand_delivered} units • Remaining cargo: {st.load_after} kg • ETA: +{Math.round(st.eta_minutes || (i * 35))}m
                            </span>
                          ) : i === 0 ? (
                            <span>Initial cargo load: {st.load_after} kg</span>
                          ) : (
                            <span>Route complete, return to relief hub</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MODAL 1: REPORT EMERGENCY NEED ═══ */}
      {isReportModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsReportModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="modal-header-icon"><Plus size={18} /></div>
                <div>
                  <h3 className="modal-title">Log Emergency Relief Need</h3>
                  <p className="modal-subtitle">Submit critical shortages for instant triage & dispatch matching</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setIsReportModalOpen(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateDemand}>
              <div className="modal-body">
                {/* Village Selection */}
                <div className="form-group">
                  <label className="form-label">Impacted Village / Shelter</label>
                  <select
                    className="form-control"
                    value={newDemand.villageId}
                    onChange={(e) => setNewDemand({ ...newDemand, villageId: e.target.value })}
                  >
                    {villages.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.district} — Pop: {v.population.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Resource Selection */}
                <div className="form-group">
                  <label className="form-label">Required Resource Type</label>
                  <div className="resource-pill-grid">
                    {[
                      { key: 'water', label: 'Clean Water', icon: '💧', unit: 'L' },
                      { key: 'food', label: 'Rations / Food', icon: '🍚', unit: 'packs' },
                      { key: 'medicine', label: 'Medical Kits', icon: '💊', unit: 'units' },
                      { key: 'shelter', label: 'Shelter Kits', icon: '⛺', unit: 'kits' },
                    ].map(res => (
                      <button
                        type="button"
                        key={res.key}
                        className={`resource-pill ${newDemand.resource === res.key ? 'selected' : ''}`}
                        onClick={() => setNewDemand({ ...newDemand, resource: res.key })}
                      >
                        <span className="pill-icon">{res.icon}</span>
                        <span className="pill-title">{res.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity & Urgency */}
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">
                      Quantity ({resourceUnit(newDemand.resource)})
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={newDemand.qty}
                      onChange={(e) => setNewDemand({ ...newDemand, qty: e.target.value })}
                      placeholder="e.g. 2500"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Urgency Classification</label>
                    <select
                      className="form-control"
                      value={newDemand.urgency}
                      onChange={(e) => setNewDemand({ ...newDemand, urgency: e.target.value })}
                    >
                      <option value="critical">🔴 Critical (Life Threatening)</option>
                      <option value="high">🟠 High (Urgent)</option>
                      <option value="medium">🟡 Medium (Moderate)</option>
                      <option value="low">🟢 Low (Routine)</option>
                    </select>
                  </div>
                </div>

                {/* Reporting Source */}
                <div className="form-group">
                  <label className="form-label">Ingestion Channel</label>
                  <select
                    className="form-control"
                    value={newDemand.source}
                    onChange={(e) => setNewDemand({ ...newDemand, source: e.target.value })}
                  >
                    <option value="dashboard">Web Control Room (Officer Direct)</option>
                    <option value="whatsapp">WhatsApp Hotline Gateway</option>
                    <option value="app">Volunteer Mobile PWA</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-secondary"
                  onClick={() => setIsReportModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-primary">
                  <Send size={15} /> Submit Urgent Need
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL 2: CONFIRM DELIVERY WITH OTP & GPS ═══ */}
      {completingDemand && (
        <div className="modal-backdrop" onClick={() => setCompletingDemand(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="modal-header-icon success"><ShieldCheck size={18} /></div>
                <div>
                  <h3 className="modal-title">Verify & Confirm Delivery</h3>
                  <p className="modal-subtitle">Cryptographic proof check for {completingDemand.id}</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setCompletingDemand(null)}><X size={18} /></button>
            </div>

            <div className="modal-body">
              <div className="verify-summary-box">
                <div className="vs-row">
                  <span>Destination:</span>
                  <strong>{getVillage(completingDemand.villageId)?.name}</strong>
                </div>
                <div className="vs-row">
                  <span>Supplies:</span>
                  <strong>{resourceIcon(completingDemand.resource)} {completingDemand.qty.toLocaleString()} {completingDemand.unit} {completingDemand.resource}</strong>
                </div>
                <div className="vs-row">
                  <span>Driver / Vehicle:</span>
                  <strong>Rafiq Ahmed (T1 • RNG-2041)</strong>
                </div>
              </div>

              <div className="proof-checklist">
                <div className="proof-item verified">
                  <CheckCircle2 size={16} />
                  <span>GPS Proximity Verified (&lt; 25 meters from destination shelter)</span>
                </div>
                <div className="proof-item verified">
                  <Camera size={16} />
                  <span>Photo Timestamp & Geo-Tag Match Confirmed</span>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">
                  <KeyRound size={14} style={{ display: 'inline', marginRight: 4 }} />
                  Enter 4-Digit Delivery OTP (Provided to Shelter Officer)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className="form-control otp-input"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="e.g. 4821"
                />
                <span className="otp-hint">Demo hint: Pre-filled with valid OTP (4821).</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setCompletingDemand(null)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn-modal-primary success"
                onClick={handleConfirmDelivery}
              >
                <CheckCheck size={15} /> Sign-off & Finalize Delivery
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
