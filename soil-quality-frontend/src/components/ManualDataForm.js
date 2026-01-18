import React, { useState } from 'react';

const ManualDataForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
    location: '',
    description: '',
    date: '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: "url('/background5.png')" }}>
      <div className="absolute inset-0 bg-black/60 z-0" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full relative z-10 max-w-md mx-auto">
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Soil Sample Name"
        className="rounded-xl border border-gray-300 bg-white/70 px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 shadow"
        required
      />
      <input
        type="text"
        name="location"
        value={form.location}
        onChange={handleChange}
        placeholder="Location"
        className="rounded-xl border border-gray-300 bg-white/70 px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 shadow"
        required
      />
      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        className="rounded-xl border border-gray-300 bg-white/70 px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 shadow"
        required
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="rounded-xl border border-gray-300 bg-white/70 px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-400 shadow"
        rows={3}
      />
      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-md transition-all w-full"
      >
        Submit
      </button>
      </form>
    </div>
  );
};

export default ManualDataForm;
