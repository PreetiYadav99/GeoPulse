import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Upload.css';

const Upload = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // add show class with stagger for animation
    const cards = document.querySelectorAll('.card');
    cards.forEach((c, i) => setTimeout(() => c.classList.add('show'), i * 180));
  }, []);

  return (
    <div className="upload-wrapper" style={{ backgroundImage: `url(${process.env.PUBLIC_URL + '/background15.jpg'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="upload-cards">
        <div className="card" onClick={() => navigate('/upload/image')}>
          {/* image icon - filled */}
          <svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect x="3" y="5" width="18" height="14" rx="2" fill="#ffffff" />
            <circle cx="8.5" cy="9.5" r="1.6" fill="#0b5137" />
            <path d="M21 19l-5-6-4 5-3-4-3 4" fill="#0b5137" />
          </svg>
          <h3>Upload Image</h3>
          <p>Upload a soil image from your device for analysis.</p>
        </div>

        <div className="card" onClick={() => navigate('/upload/live')}>
          {/* camera icon - filled */}
          <svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect x="3" y="6" width="18" height="12" rx="2" fill="#ffffff" />
            <circle cx="12" cy="12" r="3.2" fill="#0b5137" />
            <path d="M7 6l1.5-2h7L17 6" fill="#ffffff" />
          </svg>
          <h3>Live Camera</h3>
          <p>Use camera to capture live images of your soil sample.</p>
        </div>

        <div className="card" onClick={() => navigate('/upload/manual')}>
          {/* clipboard / manual icon - filled */}
          <svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect x="6" y="3" width="12" height="18" rx="2" fill="#ffffff" />
            <rect x="9" y="2" width="6" height="2" rx="0.5" fill="#0b5137" />
            <path d="M8 8h8v1H8V8zm0 3h8v1H8v-1z" fill="#0b5137" />
          </svg>
          <h3>Manual Input</h3>
          <p>Enter soil parameters manually (pH, NPK, moisture).</p>
        </div>
      </div>
    </div>
  );
};

export default Upload;
