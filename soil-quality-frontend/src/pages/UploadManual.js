

import React, { useState, useRef } from 'react';
import '../components/UploadForm.css';
import axios from 'axios';

const UploadManual = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await axios.post('http://localhost:5000/predict-manual', data);
      setSuccess(true);
      // Handle the prediction response here
      console.log('Prediction:', response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-bg" style={{ backgroundImage: "url('/background1.jpg')", minHeight: '100vh', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 0 }} />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1, position: 'relative' }}>
  <div className="upload-card" style={{ maxWidth: 1100, width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.08)', boxShadow: '0 8px 48px 0 rgba(34,197,94,0.18), 0 8px 32px 0 rgba(0,0,0,0.18)', border: '1.5px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(0px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2.5rem', color: '#22c55e', verticalAlign: 'middle', marginRight: '0.5rem' }}>🧪</span>
            <span style={{ fontWeight: 800, fontSize: '2.5rem', color: '#fff', letterSpacing: '0.01em', textShadow: '0 2px 8px #22c55e22' }}>Predict Soil Quality</span>
            <div style={{ color: '#FFD600', fontWeight: 600, fontSize: '1.25rem', marginTop: '0.5rem', marginBottom: '0.5rem', textShadow: '0 2px 8px #0008' }}>
              Fill out the following soil properties to analyze your soil quality and get recommendations.
            </div>
            {error && (
              <div style={{ color: '#ff4444', fontWeight: 600, fontSize: '1.1rem', marginTop: '1rem' }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ color: '#22c55e', fontWeight: 600, fontSize: '1.1rem', marginTop: '1rem' }}>
                Prediction successful! Check the results below.
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 950, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>pH <span style={{ color: '#FFD600', fontSize: '0.95rem' }}>(3.5 - 9.0)</span></label>
                <input type="number" name="ph" min="3.5" max="9.0" step="0.01" placeholder="e.g. 6.5" style={{ borderRadius: '0.7rem', border: '1.5px solid #22c55e', padding: '0.9rem 1.1rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.95)', color: '#222', fontWeight: 500 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>Nitrogen (N) <span style={{ color: '#FFD600', fontSize: '0.95rem' }}>(0 - 1400 mg/kg)</span></label>
                <input type="number" name="nitrogen" min="0" max="1400" placeholder="e.g. 350" style={{ borderRadius: '0.7rem', border: '1.5px solid #22c55e', padding: '0.9rem 1.1rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.95)', color: '#222', fontWeight: 500 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>Phosphorus (P) <span style={{ color: '#FFD600', fontSize: '0.95rem' }}>(0 - 200 mg/kg)</span></label>
                <input type="number" name="phosphorus" min="0" max="200" placeholder="e.g. 40" style={{ borderRadius: '0.7rem', border: '1.5px solid #22c55e', padding: '0.9rem 1.1rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.95)', color: '#222', fontWeight: 500 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>Potassium (K) <span style={{ color: '#FFD600', fontSize: '0.95rem' }}>(0 - 1200 mg/kg)</span></label>
                <input type="number" name="potassium" min="0" max="1200" placeholder="e.g. 250" style={{ borderRadius: '0.7rem', border: '1.5px solid #22c55e', padding: '0.9rem 1.1rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.95)', color: '#222', fontWeight: 500 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>Moisture <span style={{ color: '#FFD600', fontSize: '0.95rem' }}>(0 - 100 %)</span></label>
                <input type="number" name="moisture" min="0" max="100" placeholder="e.g. 25" style={{ borderRadius: '0.7rem', border: '1.5px solid #22c55e', padding: '0.9rem 1.1rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.95)', color: '#222', fontWeight: 500 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>Organic Carbon <span style={{ color: '#FFD600', fontSize: '0.95rem' }}>(0 - 2.5 %)</span></label>
                <input type="number" name="organic_carbon" min="0" max="2.5" step="0.01" placeholder="e.g. 0.8" style={{ borderRadius: '0.7rem', border: '1.5px solid #22c55e', padding: '0.9rem 1.1rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.95)', color: '#222', fontWeight: 500 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>Electrical Conductivity <span style={{ color: '#FFD600', fontSize: '0.95rem' }}>(0 - 4 dS/m)</span></label>
                <input type="number" name="ec" min="0" max="4" step="0.01" placeholder="e.g. 1.2" style={{ borderRadius: '0.7rem', border: '1.5px solid #22c55e', padding: '0.9rem 1.1rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.95)', color: '#222', fontWeight: 500 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>Soil Texture <span style={{ color: '#FFD600', fontSize: '0.95rem' }}>(e.g. Sandy, Loamy, Clayey)</span></label>
                <input type="text" name="texture" placeholder="e.g. Loamy" style={{ borderRadius: '0.7rem', border: '1.5px solid #22c55e', padding: '0.9rem 1.1rem', fontSize: '1.1rem', background: 'rgba(255,255,255,0.95)', color: '#222', fontWeight: 500 }} />
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button type="submit" style={{ background: '#FFD600', color: '#222', fontWeight: 700, fontSize: '1.25rem', borderRadius: '2rem', padding: '0.9rem 3.5rem', boxShadow: '0 4px 24px #FFD60055', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background='#ffe066'}
                onMouseOut={e => e.currentTarget.style.background='#FFD600'}>
                Predict Now
              </button>
            </div>
          </form>
        </div> {/* end card */}
      </div> {/* end center flex */}
    </div>
  );
};

export default UploadManual;
