function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function classifyRisk(score: number) {
  if (score >= 76) {
    return 'Critical';
  }
  if (score >= 56) {
    return 'High';
  }
  if (score >= 31) {
    return 'Moderate';
  }
  return 'Low';
}

export function calculateRisk(environmentalData: any) {
  if (!environmentalData) {
    return {
      score: 0,
      level: 'N/A',
    };
  }

  const temperature = Number(environmentalData.temperature ?? 0);
  const humidity = Number(environmentalData.humidity ?? 0);
  const windSpeed = Number(environmentalData.windSpeed ?? 0);
  const drynessIndex = Number(environmentalData.drynessIndex ?? Math.max(0, 100 - humidity));
  const heatIndex = Number(environmentalData.heatIndex ?? temperature);

  const temperatureNormalized = clamp(temperature / 50, 0, 1);
  const drynessNormalized = clamp(drynessIndex / 100, 0, 1);
  const windNormalized = clamp(windSpeed / 60, 0, 1);
  const humidityInverseNormalized = clamp((100 - humidity) / 100, 0, 1);
  const heatIndexNormalized = clamp(heatIndex / 60, 0, 1);

  const weightedScore =
    temperatureNormalized * 0.3 +
    drynessNormalized * 0.25 +
    windNormalized * 0.2 +
    humidityInverseNormalized * 0.15 +
    heatIndexNormalized * 0.1;

  const score = Number((weightedScore * 100).toFixed(1));

  return {
    score,
    level: classifyRisk(score),
  };
}
