import React from 'react';
import './App.css';

function App() {
  return (
    <div className="login-container">
      <div className="logo">
        <img src="logo.png" alt="CheckMate Logo" />
      </div>
      <h1>CheckMate</h1>
      <p className="tagline">Where every claim meets community scrutiny.</p>
      <form action="submit_login_form" method="POST">
        <input type="text" placeholder="Enter username" name="username" required />
        <input type="password" placeholder="Enter Password" name="password" required />
        <button type="submit">Login</button>
      </form>
      <div className="signup">
        No account? <a href="register.html">Sign up here.</a>
      </div>
    </div>
  );
}

export default App;
