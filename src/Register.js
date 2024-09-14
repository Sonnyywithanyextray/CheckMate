// src/Register.js

import React from 'react';
import './Register.css';

import { Link } from 'react-router-dom';

function Register() {
    return (
        <div className="register-container">
        <div className="logo">
            <img src="logo.png" alt="CheckMate Logo" />
        </div>
        <h1>CheckMate</h1>
        <p className = "tagline">Register today to fact check content.</p>
            <input type="email" placeholder="Email address here" />
            <input type="password" placeholder="Enter a password here" />
            <button type="submit">Register</button>
        <div className="signup">
        <p>Already have an account? <Link to="/App">Sign in here.</Link></p>
        </div>
        </div>
    );
}

export default Register;