

import React, { useState } from 'react';
import '../components/UploadForm.css';

const UploadImage = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    // TODO: handle upload logic
    alert('Image uploaded!');
  };

  return (
    <div className="upload-bg" style={{ backgroundImage: "url('/background1.jpg')" }}>
      <div className="upload-overlay" />
      <div className="upload-content" style={{ minHeight: '100vh', justifyContent: 'center' }}>
  <div className="upload-card" style={{ width: '100%', maxWidth: 420, margin: '0 auto', animationDelay: '0.2s', background: 'rgba(255,255,255,0.10)', border: '2px solid rgba(34,197,94,0.10)', boxShadow: '0 8px 32px 0 rgba(34,197,94,0.18), 0 4px 16px 0 rgba(0,0,0,0.18)' }}>
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-6">
            {/* Header Section */}
            <div className="flex flex-col items-center w-full mb-2">
              <div className="upload-card-icon mb-1" style={{ fontSize: '2.5rem' }}>🖼️</div>
              <div className="upload-card-title mb-1" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>Upload Soil Image</div>
                <div className="upload-card-desc text-center" style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: '#16a34a' }}>Upload a soil image from your device for analysis.</div>
            </div>
            {/* File Input Section */}
            <div className="w-full flex flex-col gap-2 mb-2">
              <label className="font-semibold mb-1 text-center" style={{ color: '#22c55e' }}>Select an image file</label>
              <label className="w-full flex flex-col items-center cursor-pointer">
                <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="w-full hidden" />
                <div className="w-full h-40 bg-gray-100 border-2 border-dashed border-green-400 rounded-xl flex items-center justify-center text-green-600 text-lg mb-2" style={{ fontWeight: 600 }}>
                  {file ? <span style={{ color: '#15803d', fontWeight: 700 }}>{file.name}</span> : 'No image selected'}
                </div>
              </label>
            </div>
            {/* Submit Button */}
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-8 rounded-xl shadow-md transition-all mt-2 w-full">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadImage;
