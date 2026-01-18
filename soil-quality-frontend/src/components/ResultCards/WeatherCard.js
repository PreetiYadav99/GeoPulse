import React from 'react';

const WeatherCard = ({ day, temp, desc, Icon }) => (
  <div className="bg-white p-4 rounded shadow text-center">
    <p>{day}</p>
    <div className="text-4xl my-2"><Icon /></div>
    <p className="font-bold">{temp}</p>
    <p>{desc}</p>
  </div>
);

export default WeatherCard;
