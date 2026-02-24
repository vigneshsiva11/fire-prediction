import RiskLog from '../models/RiskLog.js';
import { parseCoordinates } from '../utils/location.js';
import { createAndStoreRiskAssessment } from '../services/riskLogService.js';

function parseRiskInput(body) {
  const parsedCoordinates = parseCoordinates(body?.latitude, body?.longitude);

  if (parsedCoordinates.error) {
    return { error: parsedCoordinates.error };
  }

  const environmentalFields = ['temperature', 'humidity', 'windSpeed', 'drynessIndex', 'heatIndex'];
  const environmentalData = {};

  for (const field of environmentalFields) {
    const value = Number(body?.[field]);

    if (!Number.isFinite(value)) {
      return { error: `${field} must be a valid number.` };
    }

    environmentalData[field] = value;
  }

  return {
    ...parsedCoordinates,
    environmentalData,
  };
}

function detectTrendDirection(logsAscending) {
  if (logsAscending.length < 2) {
    return 'stable';
  }

  const midpoint = Math.floor(logsAscending.length / 2);
  const firstHalf = logsAscending.slice(0, midpoint);
  const secondHalf = logsAscending.slice(midpoint);

  if (!firstHalf.length || !secondHalf.length) {
    return 'stable';
  }

  const firstAverage = firstHalf.reduce((sum, item) => sum + item.riskScore, 0) / firstHalf.length;
  const secondAverage = secondHalf.reduce((sum, item) => sum + item.riskScore, 0) / secondHalf.length;

  if (secondAverage - firstAverage > 1) {
    return 'increasing';
  }

  if (firstAverage - secondAverage > 1) {
    return 'decreasing';
  }

  return 'stable';
}

export async function createRiskAssessment(req, res) {
  const parsed = parseRiskInput(req.body);

  if (parsed.error) {
    return res.status(400).json({
      success: false,
      message: parsed.error,
    });
  }

  try {
    const { latitude, longitude, environmentalData } = parsed;
    const { riskLog, riskResult } = await createAndStoreRiskAssessment({ latitude, longitude, environmentalData });

    return res.status(201).json({
      success: true,
      data: {
        ...riskResult,
        latitude,
        longitude,
        environmentalSnapshot: riskLog.environmentalSnapshot,
        createdAt: riskLog.createdAt,
      },
    });
  } catch (error) {
    console.error('Failed to create risk assessment:', error.message);

    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error while calculating risk.',
    });
  }
}

export async function getRiskHistory(req, res) {
  const parsed = parseCoordinates(req.query.lat, req.query.lon);

  if (parsed.error) {
    return res.status(400).json({
      success: false,
      message: parsed.error,
    });
  }

  try {
    const { latitude, longitude } = parsed;
    const records = await RiskLog.find({ latitude, longitude }).sort({ createdAt: -1 }).limit(20);

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('Failed to retrieve risk history:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving risk history.',
    });
  }
}

export async function getRiskAnalytics(req, res) {
  const parsed = parseCoordinates(req.query.lat, req.query.lon);

  if (parsed.error) {
    return res.status(400).json({
      success: false,
      message: parsed.error,
    });
  }

  try {
    const { latitude, longitude } = parsed;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const logs = await RiskLog.find({
      latitude,
      longitude,
      createdAt: { $gte: sevenDaysAgo },
    }).sort({ createdAt: 1 });

    if (!logs.length) {
      return res.status(200).json({
        success: true,
        data: {
          averageRiskScore: 0,
          highestRecordedRisk: null,
          mostCommonRiskLevel: null,
          trendDirection: 'stable',
        },
      });
    }

    const averageRiskScore = logs.reduce((sum, log) => sum + log.riskScore, 0) / logs.length;
    const highestRecordedRisk = logs.reduce((max, log) => (log.riskScore > max.riskScore ? log : max), logs[0]);

    const levelCounts = logs.reduce((acc, log) => {
      acc[log.riskLevel] = (acc[log.riskLevel] || 0) + 1;
      return acc;
    }, {});

    const mostCommonRiskLevel = Object.entries(levelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const trendDirection = detectTrendDirection(logs);

    return res.status(200).json({
      success: true,
      data: {
        averageRiskScore: Number(averageRiskScore.toFixed(2)),
        highestRecordedRisk: {
          riskScore: highestRecordedRisk.riskScore,
          riskLevel: highestRecordedRisk.riskLevel,
          createdAt: highestRecordedRisk.createdAt,
        },
        mostCommonRiskLevel,
        trendDirection,
      },
    });
  } catch (error) {
    console.error('Failed to retrieve risk analytics:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving risk analytics.',
    });
  }
}
