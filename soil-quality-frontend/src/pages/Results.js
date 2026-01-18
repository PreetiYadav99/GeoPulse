import React from 'react';
import WeatherCard from '../components/ResultCards/WeatherCard';

const Results = () => {
  const weatherData = [
    { day: 'Today', temp: '26°C', desc: 'Sunny', Icon: () => <span>🌞</span> },
    { day: 'Tomorrow', temp: '24°C', desc: 'Cloudy', Icon: () => <span>☁️</span> },
    { day: 'Wednesday', temp: '20°C', desc: 'Rainy', Icon: () => <span>🌧️</span> }
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Results & Recommendations</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {weatherData.map((w, idx) => (
          <WeatherCard key={idx} {...w} />
        ))}
      </div>
    </div>
  );
};

export default Results;
