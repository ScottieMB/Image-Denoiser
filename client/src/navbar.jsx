import React, { useEffect, useState } from 'react';
import './navbar.css';
import { useNavigate } from 'react-router-dom';

function Navbar({ isAuthenticated, username, handleLogin, handleLogout }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
    setCurrentUsername(username);
  }, [isAuthenticated, username]);

  const handleLogoutAndNavigate = () => {
    handleLogout();
    navigate('/');   // Navigate to the home page
  };

  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/denoiser">Denoiser</a></li>
        {isLoggedIn ? (
          <>
            <li><a href="/myimages">My Images</a></li>
            <li>Welcome, {currentUsername}!</li>
          </>
        ) : (
          <>
            <li><a href="/login">Log In</a></li>
            <li><a href="/signup">Sign Up</a></li>
          </>
        )}
      </ul>
      {isLoggedIn && (
          <div className="align-right">
            <button className="logout-button" onClick={handleLogoutAndNavigate}>Log Out</button>
          </div>
        )}
        <div className="logo">
            <img src="SIU_Horiz_k.png" alt="SIU Logo" width="100" height="30" />
        </div>
    </nav>
  );
}

export default Navbar;
