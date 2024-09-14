// src/App.js
import React, { useState } from 'react';
import { auth } from './firebase';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { motion } from 'framer-motion'; 
import './Auth.css';

function App() {
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // useNavigate replaces useHistory in v6

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); // Redirect to dashboard after successful login
    } catch (err) {
      setError(err.message);
    }
  };

  // Animation variants
  const variants = {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
  };

  return (
    <motion.div 
      className="login-container" 
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="logo">
        <img src="logo.png" alt="CheckMate Logo" />
      </div>
      <h1>CheckMate</h1>
      <p className="tagline">Where every claim meets community scrutiny.</p>
      
      {error && <p className="error">{error}</p>} {/* Display error messages */}
      
      <form onSubmit={handleLogin}>
        {/* Change input type from text (username) to email */}
        <input
          type="email"
          placeholder="Enter email"
          name="email" /* Update name attribute */
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      
      <div className="signup">
        <p>No account? <Link to="/register">Sign up here.</Link></p>
      </div>
    </motion.div>
  );
}

export default App;
