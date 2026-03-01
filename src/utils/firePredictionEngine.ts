export interface HourlyRiskForecastPoint {
  hour: string;
  current: number;
  predicted: number;
  lower: number;
  upper: number;
  spreadVelocity: number;
  probability: number;
}

export interface FactorContribution {
  factor: string;
  value: number;
}

export interface FireIntelligenceResult {
  riskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  spreadVelocity: number;
  projectedBurnArea: number;
  confidenceScore: number;
  uncertaintyMargin: number;
  dynamicAlertLevel: 'Normal' | 'High Alert' | 'Critical Alert' | 'Escalation Alert';
  explanation: string;
  dominantFactor: string;
  factorContributions: FactorContribution[];
  hourlyForecast: HourlyRiskForecastPoint[];
  recommendations: string[];
  reportSummary: string;
  riskTrendDelta: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function safeNumber(value: unknown, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeTerrain(terrainRaw: number) {
  if (terrainRaw <= 1) {
    return clamp(terrainRaw, 0, 1);
  }

  return clamp(terrainRaw / 100, 0, 1);
}

function classifyRisk(score: number): FireIntelligenceResult['riskLevel'] {
  if (score >= 81) {
    return 'Critical';
  }

  if (score >= 61) {
    return 'High';
  }

  if (score >= 31) {
    return 'Moderate';
  }

  return 'Low';
}

function buildExplanation(input: {
  dominantFactor: string;
  humidity: number;
}): string {
  const { dominantFactor, humidity } = input;

  if (humidity <= 25) {
    return 'Low humidity levels are reducing natural fire suppression capacity.';
  }

  if (dominantFactor === 'temperature') {
    return 'Elevated temperature is significantly increasing ignition probability.';
  }

  if (dominantFactor === 'wind') {
    return 'Increased wind velocity is accelerating lateral fire spread.';
  }

  if (dominantFactor === 'dryness') {
    return 'Vegetation dryness is critically amplifying combustion risk.';
  }

  return 'Multiple environmental signals are collectively elevating wildfire risk conditions.';
}

function toHourLabel(offsetHours: number) {
  const date = new Date();
  date.setHours(date.getHours() + offsetHours);

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function calculateFireIntelligence(
  environmentalData: any,
  previousEnvironmentalData?: any,
  options?: {
    terrainFactor?: number;
  },
): FireIntelligenceResult {
  const temperature = safeNumber(environmentalData?.temperature);
  const humidity = clamp(safeNumber(environmentalData?.humidity), 0, 100);
  const windSpeed = safeNumber(environmentalData?.windSpeed);
  const drynessIndex = clamp(safeNumber(environmentalData?.drynessIndex, Math.max(0, 100 - humidity)), 0, 100);
  const terrainFactor = normalizeTerrain(safeNumber(environmentalData?.terrainFactor, safeNumber(options?.terrainFactor, 0.5)));

  const temperatureNormalized = clamp(temperature / 50, 0, 1);
  const windNormalized = clamp(windSpeed / 60, 0, 1);
  const drynessNormalized = clamp(drynessIndex / 100, 0, 1);
  const humidityNormalized = clamp(humidity / 100, 0, 1);

  const rawRisk =
    temperatureNormalized * 0.3 +
    windNormalized * 0.25 +
    drynessNormalized * 0.2 +
    terrainFactor * 0.1 -
    humidityNormalized * 0.15;

  // Raw model output range is approximately [-0.15, 0.85].
  const riskScore = Number(clamp(((rawRisk + 0.15) / 1) * 100, 0, 100).toFixed(1));
  const riskLevel = classifyRisk(riskScore);

  const spreadVelocity = Number((windSpeed * 0.6 + drynessIndex * 0.12).toFixed(1));

  const forecastHours = 6;
  const timeFactor = forecastHours / 10;
  const baseArea = Math.max(0.2, Number((riskScore / 100).toFixed(2)));
  const spreadExponent = clamp((spreadVelocity * timeFactor) / 20, 0, 6);
  const projectedBurnArea = Number((baseArea * Math.exp(spreadExponent)).toFixed(2));

  const prevTemp = safeNumber(previousEnvironmentalData?.temperature, temperature);
  const prevHumidity = clamp(safeNumber(previousEnvironmentalData?.humidity, humidity), 0, 100);
  const prevWind = safeNumber(previousEnvironmentalData?.windSpeed, windSpeed);

  const windTrend = Number((windSpeed - prevWind).toFixed(2));
  const tempTrend = Number((temperature - prevTemp).toFixed(2));
  const humidityTrend = Number((humidity - prevHumidity).toFixed(2));
  const trendDelta = Number((windTrend * 0.4 + tempTrend * 0.3 - humidityTrend * 0.2).toFixed(2));

  const hourlyForecast: HourlyRiskForecastPoint[] = [];
  let rollingRisk = riskScore;

  for (let hour = 1; hour <= forecastHours; hour += 1) {
    rollingRisk = clamp(rollingRisk + trendDelta, 0, 100);
    const volatilityBand = Math.max(3, Math.abs(trendDelta) * 1.2 + hour * 0.35);

    hourlyForecast.push({
      hour: toHourLabel(hour),
      current: Number(riskScore.toFixed(1)),
      predicted: Number(rollingRisk.toFixed(1)),
      lower: Number(clamp(rollingRisk - volatilityBand, 0, 100).toFixed(1)),
      upper: Number(clamp(rollingRisk + volatilityBand, 0, 100).toFixed(1)),
      spreadVelocity: Number((spreadVelocity * (1 + hour * 0.01)).toFixed(1)),
      probability: Number(clamp(rollingRisk, 0, 100).toFixed(1)),
    });
  }

  const weatherVolatility = clamp(Math.abs(windTrend) * 4 + Math.abs(tempTrend) * 2 + Math.abs(humidityTrend) * 1.5, 0, 100);
  const requiredSignals = ['temperature', 'humidity', 'windSpeed', 'drynessIndex', 'terrainFactor'];
  const missingSignals = requiredSignals.filter((key) => environmentalData?.[key] === null || environmentalData?.[key] === undefined).length;
  const dataUncertainty = (missingSignals / requiredSignals.length) * 100;
  const confidenceScore = Number(clamp(100 - (weatherVolatility * 0.5 + dataUncertainty * 0.5), 0, 100).toFixed(1));
  const uncertaintyMargin = Number(clamp((100 - confidenceScore) / 8, 1, 20).toFixed(1));

  const contributionsRaw = {
    temperature: temperatureNormalized * 30,
    wind: windNormalized * 25,
    dryness: drynessNormalized * 20,
    humidity: humidityNormalized * 15,
    terrain: terrainFactor * 10,
  };

  const dominantFactor =
    Object.entries({
      temperature: contributionsRaw.temperature,
      wind: contributionsRaw.wind,
      dryness: contributionsRaw.dryness,
      humidityLow: (1 - humidityNormalized) * 15,
    }).sort((a, b) => b[1] - a[1])[0]?.[0] || 'temperature';

  const explanation = buildExplanation({
    dominantFactor,
    humidity,
  });

  const factorContributions: FactorContribution[] = [
    { factor: 'Temperature Impact', value: Number(contributionsRaw.temperature.toFixed(1)) },
    { factor: 'Wind Speed Influence', value: Number(contributionsRaw.wind.toFixed(1)) },
    { factor: 'Vegetation Dryness', value: Number(contributionsRaw.dryness.toFixed(1)) },
    { factor: 'Humidity Suppression', value: Number(contributionsRaw.humidity.toFixed(1)) },
    { factor: 'Terrain Slope Factor', value: Number(contributionsRaw.terrain.toFixed(1)) },
  ];

  const recommendations: string[] = [];

  if (riskScore > 75) {
    recommendations.push('Deploy 2 additional surveillance drones');
  }

  if (spreadVelocity > 15) {
    recommendations.push('Increase surveillance frequency for active drone routes');
  }

  if (projectedBurnArea > 20) {
    recommendations.push('Prepare ground crew readiness near high-risk perimeter');
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain routine patrol cycle and continue passive monitoring');
  }

  let dynamicAlertLevel: FireIntelligenceResult['dynamicAlertLevel'] = 'Normal';

  if (riskScore > 85) {
    dynamicAlertLevel = 'Critical Alert';
  } else if (riskScore > 70) {
    dynamicAlertLevel = 'High Alert';
  }

  if (hourlyForecast.length >= 3) {
    const escalationDelta = hourlyForecast[2].predicted - riskScore;
    if (escalationDelta >= 8) {
      dynamicAlertLevel = 'Escalation Alert';
    }
  }

  const twoHourDelta = Number(((hourlyForecast[1]?.predicted ?? riskScore) - riskScore).toFixed(1));
  const reportSummary = `Fire risk ${twoHourDelta >= 0 ? 'increased' : 'decreased'} by ${Math.abs(twoHourDelta).toFixed(
    1,
  )}% over the last 2 hours primarily due to ${dominantFactor === 'humidityLow' ? 'declining humidity' : `${dominantFactor} pressure`}. Projected burn area growth is ${
    projectedBurnArea > 20 ? 'significant' : 'moderate'
  } under current environmental trends.`;

  return {
    riskScore,
    riskLevel,
    spreadVelocity,
    projectedBurnArea,
    confidenceScore,
    uncertaintyMargin,
    dynamicAlertLevel,
    explanation,
    dominantFactor,
    factorContributions,
    hourlyForecast,
    recommendations,
    reportSummary,
    riskTrendDelta: trendDelta,
  };
}
