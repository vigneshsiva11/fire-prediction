import mongoose from 'mongoose';
import EnvironmentalLog from '../models/EnvironmentalLog.js';
import RiskLog from '../models/RiskLog.js';
import ForestZone from '../models/ForestZone.js';
import { fetchWeatherData } from '../services/weatherService.js';
import { processEnvironmentalData } from '../services/dataProcessor.js';
import { createAndStoreRiskAssessment } from '../services/riskLogService.js';
import { parseCoordinates } from '../utils/location.js';

const CACHE_WINDOW_MS = 5 * 60 * 1000;

function mapRiskResponse(riskLog) {
  return {
    riskScore: riskLog.riskScore,
    riskLevel: riskLog.riskLevel,
    confidenceScore: riskLog.confidenceScore,
    contributingFactors: riskLog.contributingFactors,
    explanation: riskLog.explanation,
    recommendedAction: riskLog.recommendedAction,
    environmentalSnapshot: riskLog.environmentalSnapshot,
    createdAt: riskLog.createdAt,
  };
}

function mapForestZone(zone) {
  return {
    id: String(zone._id),
    name: zone.name,
    state: zone.state,
    latitude: zone.latitude,
    longitude: zone.longitude,
    radiusKm: zone.radiusKm,
    description: zone.description,
    regionCode: zone.regionCode,
    mode: 'forest',
  };
}

async function resolveModeAndLocation(query) {
  const mode = query.mode === 'live' ? 'live' : query.mode === 'forest' ? 'forest' : null;

  if (!mode) {
    return { error: 'mode is required and must be either forest or live.' };
  }

  if (mode === 'forest') {
    const zoneId = query.zoneId;

    if (!zoneId) {
      return { error: 'zoneId is required for forest mode.' };
    }

    if (!mongoose.Types.ObjectId.isValid(zoneId)) {
      console.warn('Invalid forest zone id received:', zoneId);
      return { error: 'Invalid forest zone id.' };
    }

    const zone = await ForestZone.findById(zoneId);

    if (!zone) {
      return { error: `Forest zone not found for id: ${zoneId}.` };
    }

    return {
      mode,
      latitude: zone.latitude,
      longitude: zone.longitude,
      zoneInfo: mapForestZone(zone),
    };
  }

  const parsedCoords = parseCoordinates(query.lat, query.lon);

  if (parsedCoords.error) {
    return { error: parsedCoords.error };
  }

  console.log('Incoming Lat:', parsedCoords.latitude);
  console.log('Incoming Lng:', parsedCoords.longitude);

  return {
    mode,
    latitude: parsedCoords.latitude,
    longitude: parsedCoords.longitude,
    zoneInfo: {
      id: 'live',
      name: 'Live Community Location',
      state: 'N/A',
      latitude: parsedCoords.latitude,
      longitude: parsedCoords.longitude,
      radiusKm: null,
      description: 'User geolocation-based monitoring source.',
      regionCode: 'LIVE-COMMUNITY',
      mode: 'live',
    },
  };
}

async function resolveRiskForEnvironmentalRecord(environmentalRecord, recentThreshold) {
  const existingRisk = await RiskLog.findOne({
    latitude: environmentalRecord.latitude,
    longitude: environmentalRecord.longitude,
    createdAt: { $gte: recentThreshold },
  }).sort({ createdAt: -1 });

  if (existingRisk) {
    return existingRisk;
  }

  const { riskLog } = await createAndStoreRiskAssessment({
    latitude: environmentalRecord.latitude,
    longitude: environmentalRecord.longitude,
    environmentalData: {
      temperature: environmentalRecord.temperature,
      humidity: environmentalRecord.humidity,
      windSpeed: environmentalRecord.windSpeed,
      drynessIndex: environmentalRecord.drynessIndex,
      heatIndex: environmentalRecord.heatIndex,
    },
  });

  return riskLog;
}

export async function getEnvironmentalData(req, res) {
  const resolved = await resolveModeAndLocation(req.query);

  if (resolved.error) {
    return res.status(400).json({
      success: false,
      message: resolved.error,
    });
  }

  const { latitude, longitude, zoneInfo } = resolved;

  try {
    const recentThreshold = new Date(Date.now() - CACHE_WINDOW_MS);

    const cachedRecord = await EnvironmentalLog.findOne({
      latitude,
      longitude,
      createdAt: { $gte: recentThreshold },
    }).sort({ createdAt: -1 });

    if (cachedRecord) {
      const riskLog = await resolveRiskForEnvironmentalRecord(cachedRecord, recentThreshold);

      return res.status(200).json({
        success: true,
        source: 'cache',
        zoneInfo,
        environmentalData: cachedRecord,
        riskData: mapRiskResponse(riskLog),
        data: cachedRecord,
      });
    }

    const rawData = await fetchWeatherData(latitude, longitude);
    const processedData = processEnvironmentalData(rawData);

    const savedRecord = await EnvironmentalLog.create({
      latitude,
      longitude,
      ...processedData,
      source: rawData.source ?? 'openweathermap',
    });

    const { riskLog } = await createAndStoreRiskAssessment({
      latitude,
      longitude,
      environmentalData: {
        temperature: savedRecord.temperature,
        humidity: savedRecord.humidity,
        windSpeed: savedRecord.windSpeed,
        drynessIndex: savedRecord.drynessIndex,
        heatIndex: savedRecord.heatIndex,
      },
    });

    return res.status(200).json({
      success: true,
      source: 'live',
      zoneInfo,
      environmentalData: savedRecord,
      riskData: mapRiskResponse(riskLog),
      data: savedRecord,
    });
  } catch (error) {
    console.error('Failed to get environmental data:', error.message);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error while retrieving environmental data.',
    });
  }
}

export async function getEnvironmentalHistory(req, res) {
  const resolved = await resolveModeAndLocation(req.query);

  if (resolved.error) {
    return res.status(400).json({
      success: false,
      message: resolved.error,
    });
  }

  const { latitude, longitude, zoneInfo } = resolved;

  try {
    const records = await EnvironmentalLog.find({ latitude, longitude }).sort({ createdAt: -1 }).limit(20);

    return res.status(200).json({
      success: true,
      zoneInfo,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('Failed to get environmental history:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving environmental history.',
    });
  }
}
