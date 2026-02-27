import mongoose from 'mongoose';

const droneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['idle', 'active', 'standby'],
    default: 'idle',
    index: true,
  },
  battery: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 100,
  },
  signal: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 100,
  },
  lat: {
    type: Number,
    required: true,
  },
  lon: {
    type: Number,
    required: true,
  },
  assignedLocation: {
    type: String,
    default: null,
  },
  assignedLocationLower: {
    type: String,
    default: null,
    index: true,
  },
  assignedLatitude: {
    type: Number,
    default: null,
  },
  assignedLongitude: {
    type: Number,
    default: null,
  },
});

droneSchema.index({ status: 1, assignedLocationLower: 1 });

const Drone = mongoose.model('Drone', droneSchema);

export default Drone;
