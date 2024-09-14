// src/Register.js
import React, { useState } from 'react';
import { auth } from './firebase';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { motion } from 'framer-motion'; 
import './Auth.css'; 

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const variants = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  };

  return (
    <motion.div 
      className="register-container" 
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
      <p className="tagline">Register today to fact check content.</p>
      
      {error && <p className="error">{error}</p>} {/* Display error messages */}
      
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email address here"
          name="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter a password here"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      <div className="signup">
        <p>Already have an account? <Link to="/">Sign in here.</Link></p>
      </div>
    </motion.div>
  );
}

export default Register;
