import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Simulation from './pages/Simulation';
import Drivers from './pages/Drivers';

export default function App(){
  const token = localStorage.getItem('token');
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={token ? <Dashboard/> : <Navigate to="/login" />} />
      <Route path="/simulate" element={token ? <Simulation/> : <Navigate to="/login" />} />
      <Route path="/drivers" element={token ? <Drivers/> : <Navigate to="/login" />} />
    </Routes>
  );
}
