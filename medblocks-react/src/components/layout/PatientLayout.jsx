import React from 'react';
import { Outlet } from 'react-router-dom';
import './MainLayout.css';

const PatientLayout = () => {
  return (
    <div className="main-layout">
      <Outlet />
    </div>
  );
};

export default PatientLayout;
