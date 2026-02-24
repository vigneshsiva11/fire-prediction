import RiskLog from '../models/RiskLog.js';
import { calculateFireRisk } from './riskService.js';

function toSnapshot(environmentalData) {
  return {
    temperature: environmentalData.temperature,
    humidity: environmentalData.humidity,
    windSpeed: environmentalData.windSpeed,
    drynessIndex: environmentalData.drynessIndex,
    heatIndex: environmentalData.heatIndex,
  };
}

export async function createAndStoreRiskAssessment({ latitude, longitude, environmentalData }) {
  const riskResult = calculateFireRisk(environmentalData);

  const riskLog = await RiskLog.create({
    latitude,
    longitude,
    riskScore: riskResult.riskScore,
    riskLevel: riskResult.riskLevel,
    confidenceScore: riskResult.confidenceScore,
    contributingFactors: riskResult.contributingFactors,
    explanation: riskResult.explanation,
    recommendedAction: riskResult.recommendedAction,
    environmentalSnapshot: toSnapshot(environmentalData),
  });

  return {
    riskLog,
    riskResult,
  };
}
