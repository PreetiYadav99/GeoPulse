import React, { useState } from 'react';

const UploadForm = ({ onSubmit }) => {
  const [file, setFile] = useState(null);
  const [sensorData, setSensorData] = useState({ ph: '', moisture: '', temperature: '' });

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleChange = (e) => 
    setSensorData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ file, sensorData });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md space-y-4">
      <label>Upload Soil Data File</label>
      <input type="file" onChange={handleFileChange} />
      
      <label>Soil pH</label>
      <input type="number" name="ph" value={sensorData.ph} onChange={handleChange} className="w-full border rounded px-3 py-2" />
      
      <label>Moisture (%)</label>
      <input type="number" name="moisture" value={sensorData.moisture} onChange={handleChange} className="w-full border rounded px-3 py-2" />
      
      <label>Temperature (°C)</label>
      <input type="number" name="temperature" value={sensorData.temperature} onChange={handleChange} className="w-full border rounded px-3 py-2" />
      
      <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Submit</button>
    </form>
  );
};

export default UploadForm;
