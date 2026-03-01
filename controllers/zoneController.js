import mongoose from 'mongoose';
import ForestZone from '../models/ForestZone.js';

function toZoneResponse(zone) {
  return {
    id: String(zone._id),
    name: zone.name,
    state: zone.state,
    latitude: zone.latitude,
    longitude: zone.longitude,
    radiusKm: zone.radiusKm,
    description: zone.description,
    regionCode: zone.regionCode,
    createdAt: zone.createdAt,
  };
}

export async function getZones(_req, res) {
  try {
    const zones = await ForestZone.find().sort({ name: 1 });
    console.log('Forest zones fetched:', zones.length);

    return res.status(200).json({
      success: true,
      data: zones.map(toZoneResponse),
    });
  } catch (error) {
    console.error('Failed to fetch forest zones:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch forest zones.',
    });
  }
}

export async function getZoneById(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid zone id.',
    });
  }

  try {
    const zone = await ForestZone.findById(id);

    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Forest zone not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: toZoneResponse(zone),
    });
  } catch (error) {
    console.error('Failed to fetch forest zone:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch forest zone.',
    });
  }
}

export { toZoneResponse };
