// src/Routes.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import App from './App'; 
import Register from './Register';
import Dashboard from './Dashboard';
import PrivateRoute from './components/PrivateRoute'; 
import { AnimatePresence } from 'framer-motion'; 
function AnimatedRoutes() {
  const location = useLocation();

  return (
    // 'mode="wait"' ensures exit animations complete before entering animations start
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Protected Route */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        {/* Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<App />} /> {/* Login Route */}
      </Routes>
    </AnimatePresence>
  );
}

function AppRoutes() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default AppRoutes;
