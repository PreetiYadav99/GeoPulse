import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.module.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    setError('');
      try {
        const res = await axios.post('http://localhost:5000/register', form, { withCredentials: true });
        if (res.data.message) {
          navigate('/login');
        }
      } catch (err) {
        console.error('Register error', err.response || err.message || err);
        const serverData = err.response?.data;
        const msg = serverData?.error || (typeof serverData === 'string' ? serverData : null) || err.message || 'Registration failed. Please try again.';
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
        }}>Create Account</h1>
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
            <label htmlFor="name" style={{
              color: '#ffffff',
              marginBottom: '0.5rem',
              display: 'block',
              fontSize: '0.9rem'
            }}>Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              autoComplete="name"
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
                transition: 'all 0.3s'
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
              placeholder="Choose a secure password"
              required
              autoComplete="new-password"
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p style={{
          color: '#ffffff',
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.9rem'
        }}>
          Already have an account? {' '}
          <span 
            onClick={() => navigate('/login')}
            style={{
              color: '#4CAF50',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: '600'
            }}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
