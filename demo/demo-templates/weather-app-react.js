export const weatherAppReact = {
  templateName: "React Weather App",
  description: "A beautiful weather dashboard with fake data",
  files: [
    {
      path: "package.json",
      content: `{
  "name": "react-weather-demo",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "react": "^19",
    "react-dom": "^19"
  }
}`,
    },
    {
      path: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Weather Demo</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
    },
    {
      path: "src/style.css",
      content: `* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 20px;
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  min-height: 100vh;
}

.app {
  max-width: 800px;
  margin: 0 auto;
}

.weather-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  color: white;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.location {
  text-align: center;
  margin-bottom: 30px;
}

.location h1 {
  font-size: 2.5rem;
  margin: 0;
  font-weight: 300;
}

.location p {
  margin: 5px 0;
  opacity: 0.8;
  font-size: 1.1rem;
}

.current-weather {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 30px;
  margin-bottom: 40px;
}

.weather-icon {
  font-size: 8rem;
  text-align: center;
}

.temperature {
  text-align: right;
}

.temperature .temp {
  font-size: 5rem;
  font-weight: 100;
  margin: 0;
}

.temperature .unit {
  font-size: 2rem;
  opacity: 0.7;
}

.weather-details {
  text-align: left;
}

.weather-details h3 {
  font-size: 1.5rem;
  margin: 0 0 10px;
  font-weight: 400;
}

.weather-details p {
  margin: 5px 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
}

.stat-card .icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.stat-card .value {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 5px 0;
}

.stat-card .label {
  opacity: 0.8;
  font-size: 0.9rem;
}

.forecast {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  color: white;
}

.forecast h2 {
  text-align: center;
  margin-bottom: 30px;
  font-weight: 300;
  font-size: 2rem;
}

.forecast-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.forecast-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  transition: transform 0.2s ease;
}

.forecast-item:hover {
  transform: translateY(-5px);
}

.forecast-item .day {
  font-weight: 600;
  margin-bottom: 10px;
}

.forecast-item .forecast-icon {
  font-size: 2.5rem;
  margin: 10px 0;
}

.forecast-item .temps {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.forecast-item .high {
  font-weight: 600;
}

.forecast-item .low {
  opacity: 0.7;
}

.refresh-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

@media (max-width: 600px) {
  .current-weather {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 20px;
  }
  
  .temperature {
    text-align: center;
  }
  
  .weather-details {
    text-align: center;
  }
  
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .forecast-list {
    grid-template-columns: repeat(2, 1fr);
  }
}`,
    },
    {
      path: "src/index.tsx",
      content: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./style.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element #root not found");
}

createRoot(container).render(<App />);`,
    },
    {
      path: "src/App.tsx",
      content: `import React, { useState, useEffect } from "react";

interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  feelsLike: number;
}

interface ForecastDay {
  day: string;
  icon: string;
  high: number;
  low: number;
}

const weatherConditions = [
  { condition: "Sunny", icon: "☀️" },
  { condition: "Partly Cloudy", icon: "⛅" },
  { condition: "Cloudy", icon: "☁️" },
  { condition: "Rainy", icon: "🌧️" },
  { condition: "Stormy", icon: "⛈️" },
  { condition: "Snowy", icon: "❄️" },
  { condition: "Foggy", icon: "🌫️" },
];

const cities = [
  "New York", "London", "Tokyo", "Paris", "Sydney", 
  "São Paulo", "Mumbai", "Dubai", "Singapore", "Barcelona"
];

const countries = [
  "USA", "UK", "Japan", "France", "Australia",
  "Brazil", "India", "UAE", "Singapore", "Spain"
];

const generateRandomWeather = (): WeatherData => {
  const cityIndex = Math.floor(Math.random() * cities.length);
  const conditionIndex = Math.floor(Math.random() * weatherConditions.length);
  const condition = weatherConditions[conditionIndex];
  
  return {
    location: cities[cityIndex],
    country: countries[cityIndex],
    temperature: Math.floor(Math.random() * 35) + 5, // 5-40°C
    condition: condition.condition,
    icon: condition.icon,
    humidity: Math.floor(Math.random() * 60) + 30, // 30-90%
    windSpeed: Math.floor(Math.random() * 25) + 5, // 5-30 km/h
    pressure: Math.floor(Math.random() * 50) + 990, // 990-1040 hPa
    visibility: Math.floor(Math.random() * 15) + 5, // 5-20 km
    uvIndex: Math.floor(Math.random() * 11), // 0-10
    feelsLike: Math.floor(Math.random() * 35) + 5, // 5-40°C
  };
};

const generateForecast = (): ForecastDay[] => {
  const days = ["Today", "Tomorrow", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.slice(0, 5).map(day => ({
    day,
    icon: weatherConditions[Math.floor(Math.random() * weatherConditions.length)].icon,
    high: Math.floor(Math.random() * 15) + 20, // 20-35°C
    low: Math.floor(Math.random() * 15) + 10,  // 10-25°C
  }));
};

export default function App() {
  const [weather, setWeather] = useState<WeatherData>(generateRandomWeather);
  const [forecast, setForecast] = useState<ForecastDay[]>(generateForecast);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refreshWeather = () => {
    setWeather(generateRandomWeather());
    setForecast(generateForecast());
    setLastUpdated(new Date());
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshWeather, 30000);
    return () => clearInterval(interval);
  }, []);

  const getUVIndexLevel = (uv: number) => {
    if (uv <= 2) return "Low";
    if (uv <= 5) return "Moderate";
    if (uv <= 7) return "High";
    if (uv <= 10) return "Very High";
    return "Extreme";
  };

  return (
    <div className="app">
      <div className="weather-card">
        <div className="location">
          <h1>{weather.location}</h1>
          <p>{weather.country}</p>
          <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </div>

        <div className="current-weather">
          <div className="weather-details">
            <h3>{weather.condition}</h3>
            <p>Feels like {weather.feelsLike}°C</p>
            <p>Humidity: {weather.humidity}%</p>
            <p>Wind: {weather.windSpeed} km/h</p>
          </div>
          
          <div className="weather-icon">
            {weather.icon}
          </div>
          
          <div className="temperature">
            <p className="temp">{weather.temperature}<span className="unit">°C</span></p>
          </div>
        </div>

        <div className="stats">
          <div className="stat-card">
            <div className="icon">💧</div>
            <div className="value">{weather.humidity}%</div>
            <div className="label">Humidity</div>
          </div>
          <div className="stat-card">
            <div className="icon">💨</div>
            <div className="value">{weather.windSpeed}</div>
            <div className="label">Wind km/h</div>
          </div>
          <div className="stat-card">
            <div className="icon">📊</div>
            <div className="value">{weather.pressure}</div>
            <div className="label">Pressure hPa</div>
          </div>
          <div className="stat-card">
            <div className="icon">👁️</div>
            <div className="value">{weather.visibility}</div>
            <div className="label">Visibility km</div>
          </div>
          <div className="stat-card">
            <div className="icon">☀️</div>
            <div className="value">{weather.uvIndex}</div>
            <div className="label">UV {getUVIndexLevel(weather.uvIndex)}</div>
          </div>
        </div>
      </div>

      <div className="forecast">
        <h2>5-Day Forecast</h2>
        <div className="forecast-list">
          {forecast.map((day, index) => (
            <div key={index} className="forecast-item">
              <div className="day">{day.day}</div>
              <div className="forecast-icon">{day.icon}</div>
              <div className="temps">
                <span className="high">{day.high}°</span>
                <span className="low">{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="refresh-btn" onClick={refreshWeather} title="Refresh Weather">
        🔄
      </button>
    </div>
  );
}`,
    },
  ],
  entryFile: "src/index.tsx",
};
