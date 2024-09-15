// src/Routes.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Dashboard from './Dashboard';
import Reviewer from './Reviewer';
import PrivateRoute from './components/PrivateRoute';
import App from './App';
import Register from './Register';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <div className="app-container">
      <div className="content">
        {children}
      </div>
      <Footer />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/reviewer/:reportId"
          element={
            <PrivateRoute>
              <Reviewer />
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
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </Router>
  );
}

export default AppRoutes;