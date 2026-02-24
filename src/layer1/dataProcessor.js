function toCelsius(temp, unit = 'C') {
  if (typeof temp !== 'number') {
    return null;
  }

  return unit === 'K' ? temp - 273.15 : unit === 'F' ? ((temp - 32) * 5) / 9 : temp;
}

function toKilometersPerHour(speed, unit = 'm/s') {
  if (typeof speed !== 'number') {
    return null;
  }

  if (unit === 'km/h') {
    return speed;
  }

  if (unit === 'mph') {
    return speed * 1.60934;
  }

  return speed * 3.6;
}

function calculateHeatIndexC(temperatureC, humidity) {
  if (typeof temperatureC !== 'number' || typeof humidity !== 'number') {
    return null;
  }

  const temperatureF = (temperatureC * 9) / 5 + 32;

  if (temperatureF < 80) {
    return temperatureC + humidity * 0.05;
  }

  const heatIndexF =
    -42.379 +
    2.04901523 * temperatureF +
    10.14333127 * humidity -
    0.22475541 * temperatureF * humidity -
    0.00683783 * temperatureF * temperatureF -
    0.05481717 * humidity * humidity +
    0.00122874 * temperatureF * temperatureF * humidity +
    0.00085282 * temperatureF * humidity * humidity -
    0.00000199 * temperatureF * temperatureF * humidity * humidity;

  return ((heatIndexF - 32) * 5) / 9;
}

function roundValue(value, digits = 1) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function processEnvironmentalData(rawData) {
  if (!rawData) {
    throw new Error('No environmental data received from weather service.');
  }

  const temperatureC = toCelsius(rawData.temperature, rawData.tempUnit);
  const humidity = typeof rawData.humidity === 'number' ? Math.max(0, Math.min(100, rawData.humidity)) : null;
  const windSpeedKmh = toKilometersPerHour(rawData.windSpeed, rawData.windUnit);
  const pressure = typeof rawData.pressure === 'number' ? rawData.pressure : null;

  const drynessIndex = humidity === null ? null : 100 - humidity;
  const windImpactScore = windSpeedKmh === null ? null : windSpeedKmh * 0.7;
  const heatIndex = calculateHeatIndexC(temperatureC, humidity);

  return {
    temperature: roundValue(temperatureC, 1),
    humidity: roundValue(humidity, 0),
    windSpeed: roundValue(windSpeedKmh, 1),
    pressure: roundValue(pressure, 0),
    drynessIndex: roundValue(drynessIndex, 1),
    windImpactScore: roundValue(windImpactScore, 1),
    heatIndex: roundValue(heatIndex, 1),
    weatherDescription: rawData.weatherDescription ?? 'Unknown',
    timestamp: new Date(rawData.observedAt ?? Date.now()).toISOString(),
  };
}
