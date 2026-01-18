

import React, { useState } from 'react';
import WebcamCapture from '../components/WebcamCapture';
import '../components/UploadForm.css';


const UploadLive = () => {
  const [imgSrc, setImgSrc] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleCapture = (dataUrl) => {
    setImgSrc(dataUrl);
    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imgSrc) return;
    setSubmitted(true);
    // TODO: handle live image submit logic
    alert('Live image submitted!');
  };

  return (
    <div className="upload-bg" style={{ backgroundImage: "url('/background2.jpg')" }}>
      <div className="upload-overlay" />
      <div className="upload-content" style={{ minHeight: '100vh', justifyContent: 'center' }}>
        <div className="upload-card" style={{ width: '100%', maxWidth: 420, margin: '0 auto', animationDelay: '0.2s' }}>
          <form className="w-full flex flex-col items-center gap-5" onSubmit={handleSubmit}>
            <div className="upload-card-icon" style={{ fontSize: '2.5rem' }}>📷</div>
            <div className="upload-card-title" style={{ fontSize: '1.5rem', color: '#22c55e', fontWeight: 700 }}>Live Camera</div>
            <div className="upload-card-desc text-center" style={{ color: '#16a34a', fontSize: '1.05rem', marginBottom: '0.5rem' }}>Capture a live photo of your soil sample.</div>
            {!imgSrc && (
              <WebcamCapture onCapture={handleCapture} />
            )}
            {imgSrc && (
              <div className="w-full flex flex-col items-center gap-2">
                <img src={imgSrc} alt="Captured" className="rounded-xl shadow w-full max-h-60 object-contain mt-2" />
                <button type="button" className="text-green-700 underline text-sm mt-1" onClick={() => setImgSrc(null)}>Retake</button>
              </div>
            )}
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-8 rounded-xl shadow-md transition-all w-full" disabled={!imgSrc || submitted}>
              {submitted ? 'Submitted!' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadLive;
