function toCelsius(temperature, unit = 'K') {
  if (typeof temperature !== 'number' || Number.isNaN(temperature)) {
    throw new Error('Temperature is missing or invalid from weather provider.');
  }

  if (unit === 'C') {
    return temperature;
  }

  if (unit === 'F') {
    return (temperature - 32) * (5 / 9);
  }

  return temperature - 273.15;
}

function toKmPerHour(speed, unit = 'm/s') {
  if (typeof speed !== 'number' || Number.isNaN(speed)) {
    throw new Error('Wind speed is missing or invalid from weather provider.');
  }

  if (unit === 'km/h') {
    return speed;
  }

  if (unit === 'mph') {
    return speed * 1.60934;
  }

  return speed * 3.6;
}

function round(value, precision = 2) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function processEnvironmentalData(rawData) {
  if (!rawData) {
    throw new Error('Raw weather data is required for processing.');
  }

  const temperature = toCelsius(rawData.temperature, rawData.tempUnit);
  const humidity = Number(rawData.humidity);
  const windSpeed = toKmPerHour(rawData.windSpeed, rawData.windUnit);
  const pressure = Number(rawData.pressure);

  if (!Number.isFinite(humidity) || humidity < 0 || humidity > 100) {
    throw new Error('Humidity is missing or out of range from weather provider.');
  }

  if (!Number.isFinite(pressure)) {
    throw new Error('Pressure is missing or invalid from weather provider.');
  }

  const drynessIndex = 100 - humidity;
  const heatIndex = temperature + humidity * 0.1;

  return {
    temperature: round(temperature),
    humidity: round(humidity),
    windSpeed: round(windSpeed),
    pressure: round(pressure),
    drynessIndex: round(drynessIndex),
    heatIndex: round(heatIndex),
    weatherDescription: rawData.weatherDescription ?? 'Unknown',
  };
}
