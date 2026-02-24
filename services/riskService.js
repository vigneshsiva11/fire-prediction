function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value, precision = 2) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function normalizeInputs(data) {
  const temperatureNormalized = clamp(data.temperature / 50, 0, 1);
  const drynessNormalized = clamp(data.drynessIndex / 100, 0, 1);
  const windNormalized = clamp(data.windSpeed / 60, 0, 1);
  const humidityInverseNormalized = clamp((100 - data.humidity) / 100, 0, 1);
  const heatIndexNormalized = clamp(data.heatIndex / 60, 0, 1);

  return {
    temperatureNormalized,
    drynessNormalized,
    windNormalized,
    humidityInverseNormalized,
    heatIndexNormalized,
  };
}

function classifyRisk(score) {
  if (score <= 30) {
    return 'Low';
  }

  if (score <= 55) {
    return 'Moderate';
  }

  if (score <= 75) {
    return 'High';
  }

  return 'Critical';
}

function getRecommendedAction(riskLevel) {
  const actions = {
    Low: 'Continue routine monitoring',
    Moderate: 'Increase patrol and review alerts',
    High: 'Deploy drone surveillance and standby teams',
    Critical: 'Immediate authority notification and emergency preparation',
  };

  return actions[riskLevel];
}

function buildExplanation(normalizedFactors) {
  const explanations = [];

  if (normalizedFactors.temperatureNormalized >= 0.7 && normalizedFactors.drynessNormalized >= 0.7) {
    explanations.push('High temperature and dryness indicate elevated ignition probability.');
  }

  if (normalizedFactors.windNormalized >= 0.65) {
    explanations.push('Strong winds increase rapid fire spread potential.');
  }

  if (normalizedFactors.humidityInverseNormalized >= 0.65) {
    explanations.push('Low humidity increases vegetation flammability.');
  }

  if (normalizedFactors.heatIndexNormalized >= 0.7) {
    explanations.push('Elevated heat index intensifies fire behavior conditions.');
  }

  if (explanations.length === 0) {
    explanations.push('Current environmental conditions indicate controlled fire potential with no dominant extreme factor.');
  }

  return explanations.join(' ');
}

function getContributingFactors(normalizedFactors) {
  const readableLabels = {
    temperatureNormalized: 'Temperature',
    drynessNormalized: 'Dryness',
    windNormalized: 'Wind Speed',
    humidityInverseNormalized: 'Low Humidity',
    heatIndexNormalized: 'Heat Index',
  };

  return Object.entries(normalizedFactors)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([key]) => readableLabels[key]);
}

function validateEnvironmentalData(environmentalData) {
  const requiredFields = ['temperature', 'humidity', 'windSpeed', 'drynessIndex', 'heatIndex'];

  for (const field of requiredFields) {
    const value = environmentalData?.[field];
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new Error(`Invalid environmental field: ${field}.`);
    }
  }
}

export function calculateFireRisk(environmentalData) {
  validateEnvironmentalData(environmentalData);

  const normalizedFactors = normalizeInputs(environmentalData);

  const baseRiskScore =
    normalizedFactors.temperatureNormalized * 0.3 +
    normalizedFactors.drynessNormalized * 0.25 +
    normalizedFactors.windNormalized * 0.2 +
    normalizedFactors.humidityInverseNormalized * 0.15 +
    normalizedFactors.heatIndexNormalized * 0.1;

  const finalScore = round(baseRiskScore * 100, 2);
  const riskLevel = classifyRisk(finalScore);
  const contributingFactors = getContributingFactors(normalizedFactors);
  const explanation = buildExplanation(normalizedFactors);
  const recommendedAction = getRecommendedAction(riskLevel);

  const confidenceScore = round(
    ((normalizedFactors.temperatureNormalized +
      normalizedFactors.drynessNormalized +
      normalizedFactors.windNormalized +
      normalizedFactors.humidityInverseNormalized +
      normalizedFactors.heatIndexNormalized) /
      5) *
      100,
    2,
  );

  return {
    riskScore: finalScore,
    riskLevel,
    contributingFactors,
    explanation,
    recommendedAction,
    confidenceScore,
  };
}
