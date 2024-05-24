import { useState, useEffect } from 'react'
import Navbar from './navbar';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home.jsx';
import SignUp from './pages/signup.jsx';
import Denoiser from './pages/denoiser.jsx';
import axios from 'axios'
import Login from './pages/login.jsx';
import MyImages from './pages/myimages.jsx'
import About from './pages/about.jsx'

function App() {
  const fetchAPI = async() => {
    const response = await axios.get("https://butlerblock.pythonanywhere.com");
  };
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  const handleLogin = (username) => {
    setIsAuthenticated(true);
    setUsername(username);
    localStorage.setItem('isAuthenticated', true);
    localStorage.setItem('username', username);
  };

    const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
  };

  useEffect(() => {
    fetchAPI();
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const username = localStorage.getItem('username');
    setIsAuthenticated(isAuthenticated);
    setUsername(username || '');
}, []);

  return (
    <Router>
      <Navbar
        isAuthenticated={isAuthenticated}
        username={username}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp handleLogin={handleLogin} />} />
        <Route path="/denoiser" element={<Denoiser isAuthenticated={isAuthenticated} username={username} />} />
        <Route path="/login" element={<Login handleLogin={handleLogin} />} />
        <Route path="/myimages" element={<MyImages username={username} />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App
