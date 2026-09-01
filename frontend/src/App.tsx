import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ServiceRegistry from './pages/ServiceRegistry';
import RegisterService from './pages/RegisterService';
import CreateIncident from './pages/CreateIncident';
import IncidentDetail from './pages/IncidentDetail';

const navClass = ({ isActive }: { isActive: boolean }): string =>
  isActive ? 'nav-link active' : 'nav-link';

function Sidebar(): React.ReactElement {
  return (
    <aside className="sidebar">
      <p className="sidebar__brand">Service Health</p>
      <nav aria-label="Main navigation">
        <NavLink to="/" className={navClass} end>Dashboard</NavLink>
        <NavLink to="/services" className={navClass}>Services</NavLink>
        <NavLink to="/register" className={navClass}>Register Service</NavLink>
      </nav>
    </aside>
  );
}

export default function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/services" element={<ServiceRegistry />} />
            <Route path="/register" element={<RegisterService />} />
            <Route path="/incidents/new" element={<CreateIncident />} />
            <Route path="/incidents/:id" element={<IncidentDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
