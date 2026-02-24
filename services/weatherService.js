import axios from 'axios';

const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function fetchWeatherData(lat, lon) {
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    throw new Error('WEATHER_API_KEY is not defined in environment variables.');
  }

  try {
    const response = await axios.get(OPENWEATHER_URL, {
      params: {
        lat,
        lon,
        appid: apiKey,
      },
      timeout: 10000,
    });

    const payload = response.data;

    return {
      temperature: payload?.main?.temp,
      humidity: payload?.main?.humidity,
      windSpeed: payload?.wind?.speed,
      pressure: payload?.main?.pressure,
      weatherDescription: payload?.weather?.[0]?.description ?? 'Unknown',
      tempUnit: 'K',
      windUnit: 'm/s',
      source: 'openweathermap',
    };
  } catch (error) {
    const apiMessage = error.response?.data?.message;
    const message = apiMessage ? `Weather API error: ${apiMessage}` : 'Failed to fetch weather data.';
    const wrappedError = new Error(message);
    wrappedError.status = error.response?.status ?? 502;
    throw wrappedError;
  }
}
