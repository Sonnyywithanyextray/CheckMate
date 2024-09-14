// src/Routes.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import Register from './Register';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/app" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<App />} /> {/* Default route */}
      </Routes>
    </Router>
  );
}

export default AppRoutes;
