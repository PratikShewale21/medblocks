import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaShieldAlt, FaChartLine, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './DoctorLayout.css';

const DoctorLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="doctor-shell">
      <aside className="sidebar">
        <div className="logo">
          <NavLink to="/doctor" style={{ textDecoration: 'none', color: 'inherit' }}>
            MedBlocks<span>.</span>
          </NavLink>
        </div>

        <NavLink to="/doctor" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <FaHome /> Dashboard
        </NavLink>
        <NavLink to="/doctor/patients" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <FaUsers /> My Patients
        </NavLink>
        <NavLink to="/doctor/access" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <FaShieldAlt /> Access Manager
        </NavLink>
        <NavLink to="/doctor/analytics" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <FaChartLine /> Risk Analytics
        </NavLink>

        <div style={{ marginTop: 'auto' }}>
          <a href="#/settings" className="nav-link">
            <FaCog /> Settings
          </a>
          <button
            type="button"
            className="nav-link"
            style={{ color: '#EF4444', background: 'transparent', border: 'none', textAlign: 'left' }}
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
};

export default DoctorLayout;
