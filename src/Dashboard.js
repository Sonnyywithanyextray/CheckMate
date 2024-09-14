// src/Dashboard.js
import React, { useContext } from 'react';
import { AuthContext } from './context/AuthContext'; 
import { auth } from './firebase';
import { signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom'; // useNavigate replaces useHistory in v6
import { motion } from 'framer-motion';
import './Dashboard.css'; 

function Dashboard() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to login page after logout
    } catch (err) {
      console.error('Failed to logout:', err.message);
    }
  };

  // Animation variants
  const variants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  return (
    <motion.div 
      className="dashboard-container" 
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <h1>Welcome to CheckMate Dashboard</h1>
      <p>Email: {currentUser && currentUser.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </motion.div>
  );
}

export default Dashboard;
