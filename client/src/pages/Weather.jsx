import React from 'react';
import WeatherWidget from '../components/WeatherWidget';

const Weather = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-minimal-text tracking-tight">Weather Forecast</h1>
        <p className="text-minimal-muted max-w-xl mx-auto">
          Get real-time weather updates for your favorite destinations to plan your activities better.
        </p>
      </header>

      <main className="flex justify-center pt-8">
        <div className="w-full max-w-md">
          <WeatherWidget defaultCity="Dhaka" />
        </div>
      </main>
    </div>
  );
};

export default Weather;
