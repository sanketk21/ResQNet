import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Pipeline from './pages/Pipeline';
import Architecture from './pages/Architecture';
import Dashboard from './pages/Dashboard';
import './index.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
