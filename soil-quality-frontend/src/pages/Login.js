import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Login.module.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      console.log('Attempting login with:', form);
      const res = await axios.post('http://localhost:5000/login', form, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Server response:', res.data);
      if (res.data.user_id) {
        // Store simple token/user in context
        login(res.data.user_id);
        navigate('/');
      }
    } catch (err) {
      console.error('Login error', err.response || err.message || err);
      const serverData = err.response?.data;
      const msg = serverData?.error || (typeof serverData === 'string' ? serverData : null) || err.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `url('/images/public/login_background.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
      }} />
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '2rem',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        position: 'relative',
        zIndex: 1
      }}>
        <h1 style={{
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: '2rem',
          fontSize: '2rem',
          fontWeight: '600',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>Welcome Back</h1>
        {error && <div style={{
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          color: '#ff6b6b',
          padding: '0.8rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{
              color: '#ffffff',
              marginBottom: '0.5rem',
              display: 'block',
              fontSize: '0.9rem'
            }}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s',
                '&:focus': {
                  borderColor: '#4CAF50',
                  boxShadow: '0 0 0 2px rgba(76, 175, 80, 0.2)'
                }
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{
              color: '#ffffff',
              marginBottom: '0.5rem',
              display: 'block',
              fontSize: '0.9rem'
            }}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s'
              }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#4CAF50',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              opacity: loading ? '0.7' : '1',
              transform: loading ? 'scale(0.98)' : 'scale(1)'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{
          color: '#ffffff',
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.9rem'
        }}>
          Don't have an account? {' '}
          <span 
            onClick={() => navigate('/register')}
            style={{
              color: '#4CAF50',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: '600'
            }}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;