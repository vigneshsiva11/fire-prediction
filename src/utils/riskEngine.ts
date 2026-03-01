import { calculateFireIntelligence } from '@/utils/firePredictionEngine';

export function calculateRisk(environmentalData: any) {
  if (!environmentalData) {
    return {
      score: 0,
      level: 'N/A',
    };
  }

  const result = calculateFireIntelligence(environmentalData);

  return {
    score: result.riskScore,
    level: result.riskLevel,
  };
}
