import mongoose from 'mongoose';
import Drone from '../models/Drone.js';
import DroneCapture from '../models/DroneCapture.js';

const DEFAULT_DRONES = [
  { name: 'Drone Alpha', status: 'idle', battery: 92, signal: 88, lat: 12.9716, lon: 77.5946 },
  { name: 'Drone Beta', status: 'standby', battery: 84, signal: 90, lat: 13.0827, lon: 80.2707 },
  { name: 'Drone Gamma', status: 'idle', battery: 76, signal: 80, lat: 17.385, lon: 78.4867 },
  { name: 'Drone Delta', status: 'standby', battery: 68, signal: 74, lat: 19.076, lon: 72.8777 },
  { name: 'Drone Echo', status: 'idle', battery: 95, signal: 93, lat: 28.6139, lon: 77.209 },
];

async function ensureDroneFleet() {
  const count = await Drone.countDocuments();

  if (count > 0) {
    return;
  }

  await Drone.insertMany(DEFAULT_DRONES);
}

function normalizeLocation(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidBase64Image(data) {
  if (typeof data !== 'string') {
    return false;
  }

  return /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=\r\n]+$/.test(data.trim());
}

export async function getAvailableDrones(req, res) {
  try {
    await ensureDroneFleet();

    const location = (req.query.location || '').trim();
    const normalizedLocation = normalizeLocation(location);
    const query = { status: { $ne: 'active' } };

    if (normalizedLocation) {
      query.$or = [
        { assignedLocationLower: null },
        { assignedLocationLower: normalizedLocation },
        { assignedLocation: { $regex: new RegExp(`^${location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
      ];
    }

    const drones = await Drone.find(query).sort({ battery: -1, signal: -1, name: 1 });

    return res.status(200).json({
      success: true,
      count: drones.length,
      data: drones,
    });
  } catch (error) {
    console.error('Failed to fetch available drones:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch available drones.',
    });
  }
}

export async function getActiveDrones(req, res) {
  try {
    await ensureDroneFleet();
    const location = (req.query.location || '').trim();
    const normalizedLocation = normalizeLocation(location);

    const query = { status: 'active' };
    if (normalizedLocation) {
      query.$or = [
        { assignedLocationLower: normalizedLocation },
        { assignedLocation: { $regex: new RegExp(`^${location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
      ];
    }

    const drones = await Drone.find(query).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: drones.length,
      data: drones,
    });
  } catch (error) {
    console.error('Failed to fetch active drones:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch active drones.',
    });
  }
}

export async function activateDrone(req, res) {
  try {
    const { droneId, locationName, lat, lon } = req.body || {};

    if (!droneId || !locationName || typeof lat !== 'number' || typeof lon !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'droneId, locationName, lat, and lon are required.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(droneId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid droneId.',
      });
    }

    const drone = await Drone.findById(droneId);

    if (!drone) {
      return res.status(404).json({
        success: false,
        message: 'Drone not found.',
      });
    }

    drone.status = 'active';
    drone.assignedLocation = locationName;
    drone.assignedLocationLower = normalizeLocation(locationName);
    drone.assignedLatitude = Number(lat);
    drone.assignedLongitude = Number(lon);
    drone.lat = Number(lat);
    drone.lon = Number(lon);
    await drone.save();

    return res.status(200).json({
      success: true,
      message: 'Drone activated successfully.',
      data: drone,
    });
  } catch (error) {
    console.error('Failed to activate drone:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to activate drone.',
    });
  }
}

export async function stopDrone(req, res) {
  try {
    const { droneId } = req.body || {};

    if (!droneId) {
      return res.status(400).json({
        success: false,
        message: 'droneId is required.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(droneId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid droneId.',
      });
    }

    const drone = await Drone.findById(droneId);

    if (!drone) {
      return res.status(404).json({
        success: false,
        message: 'Drone not found.',
      });
    }

    drone.status = 'standby';
    await drone.save();

    return res.status(200).json({
      success: true,
      message: 'Drone moved to standby.',
      data: drone,
    });
  } catch (error) {
    console.error('Failed to stop drone:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to stop drone.',
    });
  }
}

export async function captureDroneImage(req, res) {
  try {
    const { location, droneId, imageBase64, timestamp } = req.body || {};

    if (!location || !droneId || !imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'location, droneId, and imageBase64 are required.',
      });
    }

    if (!isValidBase64Image(imageBase64)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid imageBase64 format. Expected data:image/<type>;base64,<payload>.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(droneId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid droneId.',
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is not active.',
      });
    }

    const drone = await Drone.findById(droneId);
    if (!drone) {
      return res.status(404).json({
        success: false,
        message: 'Drone not found for capture.',
      });
    }

    const capture = await DroneCapture.create({
      location,
      droneId: String(droneId),
      image: imageBase64,
      createdAt: timestamp ? new Date(timestamp) : new Date(),
    });

    return res.status(201).json({
      success: true,
      data: capture,
    });
  } catch (error) {
    console.error('CAPTURE ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to store satellite capture.',
    });
  }
}

export async function getDroneCaptures(req, res) {
  try {
    const location = (req.query.location || '').trim();
    const query = location ? { location } : {};

    const captures = await DroneCapture.find(query).sort({ createdAt: -1 }).limit(24);

    const droneIds = [...new Set(captures.map((capture) => capture.droneId))].filter((id) => mongoose.Types.ObjectId.isValid(id));
    const drones = await Drone.find({ _id: { $in: droneIds } }).select({ name: 1 }).lean();
    const droneMap = new Map(drones.map((drone) => [String(drone._id), drone.name]));

    const mapped = captures.map((capture) => ({
      _id: capture._id,
      location: capture.location,
      droneId: capture.droneId,
      droneName: droneMap.get(capture.droneId) || 'Unknown Drone',
      imageBase64: capture.image,
      createdAt: capture.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count: mapped.length,
      data: mapped,
    });
  } catch (error) {
    console.error('CAPTURE ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch satellite captures.',
    });
  }
}
