import React from 'react';
import CropRecommendationCard from '../components/ResultCards/CropRecommendationCard';
import FertilizerCard from '../components/ResultCards/FertilizerCard';
import InteractiveCropCard from '../components/ResultCards/InteractiveCropCard';
import SoilChart from '../components/ResultCards/SoilChart';
import SoilStatusCard from '../components/ResultCards/SoilStatusCard';
import WeatherCard from '../components/ResultCards/WeatherCard';

export default function Recommendations() {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: "url('/background6.jpg') center/cover no-repeat",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 0',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '2.5rem',
        width: '90vw',
        maxWidth: '1400px',
        background: 'rgba(255,255,255,0.18)',
        borderRadius: '2rem',
        boxShadow: '0 8px 32px #185a9d44',
        padding: '2.5rem',
      }}>
        <CropRecommendationCard />
        <FertilizerCard />
        <InteractiveCropCard />
        <SoilChart />
        <SoilStatusCard />
        <WeatherCard />
      </div>
    </div>
  );
}
