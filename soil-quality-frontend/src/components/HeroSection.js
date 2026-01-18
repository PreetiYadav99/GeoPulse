import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => (
  <section className="bg-green-200 p-10 rounded-lg text-center">
    <h1 className="text-4xl font-bold mb-4">AI-Powered Soil Quality Analysis</h1>
    <p className="mb-6">Upload your soil data and get crop recommendations with fertilizer and weather adjustments.</p>
    <Link to="/upload" className="bg-green-700 text-white px-6 py-3 rounded-md hover:bg-green-800 transition">
      Upload Soil Data
    </Link>
  </section>
);

export default HeroSection;
