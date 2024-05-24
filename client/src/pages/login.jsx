import React, { useState } from 'react';
import axios from 'axios';
import './login.css';

function Login({ handleLogin }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/login', {
        username_or_email: usernameOrEmail,
        password,
      });
      setMessage(response.data.message);
      // Reset form fields if login is successful
      if (response.data.message === 'Login successful') {
        handleLogin(usernameOrEmail);
        setUsernameOrEmail('');
        setPassword('');
      }
    } catch (error) {
      setMessage('Failed to log in. Please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <div>
      <div className="login-container">
        <div className="login-card">
          <h2>Login</h2>
          {message && <p>{message}</p>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email or Username</label>
            <input
              type="text"
              id="email"
              placeholder="Enter your email or username"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
            />
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Log In</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;