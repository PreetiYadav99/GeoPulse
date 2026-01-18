import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggle = () => setOpen(v => !v);
  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    close();
  };

  return (
    <header className="navbar">
      <div className="logo">SoilScope</div>

      <button
        className={`menu-toggle ${open ? 'open' : ''}`}
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={toggle}
      >
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      <nav>
        <ul className={open ? 'open' : ''}>
          <li><NavLink to="/" onClick={close} className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink></li>
          {user ? (
            <>
              <li><NavLink to="/upload" onClick={close} className={({ isActive }) => (isActive ? 'active' : '')}>Upload Soil Data</NavLink></li>
              <li><NavLink to="/results" onClick={close} className={({ isActive }) => (isActive ? 'active' : '')}>Recommendations</NavLink></li>
            </>
          ) : null}
          <li><NavLink to="/about" onClick={close} className={({ isActive }) => (isActive ? 'active' : '')}>About</NavLink></li>
          <li><NavLink to="/contact" onClick={close} className={({ isActive }) => (isActive ? 'active' : '')}>Contact</NavLink></li>
          {user ? (
            <li><button onClick={handleLogout} className="nav-button">Logout</button></li>
          ) : (
            <>
              <li><NavLink to="/login" onClick={close} className={({ isActive }) => (isActive ? 'nav-button active' : 'nav-button')}>Login</NavLink></li>
              <li><NavLink to="/register" onClick={close} className={({ isActive }) => (isActive ? 'nav-button active' : 'nav-button')}>Register</NavLink></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
