import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ServiceRegistry from './pages/ServiceRegistry';
import RegisterService from './pages/RegisterService';

function NavBar(): React.ReactElement {
  const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    marginRight: '1rem',
    fontWeight: isActive ? 'bold' : 'normal',
    textDecoration: 'none',
    color: isActive ? '#1a1a1a' : '#555',
  });

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ddd', marginBottom: '1rem' }}>
      <NavLink to="/" end style={linkStyle}>
        Dashboard
      </NavLink>
      <NavLink to="/services" style={linkStyle}>
        Services
      </NavLink>
      <NavLink to="/register" style={linkStyle}>
        Register Service
      </NavLink>
    </nav>
  );
}

export default function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <NavBar />
      <main style={{ padding: '0 1rem' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/services" element={<ServiceRegistry />} />
          <Route path="/register" element={<RegisterService />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
