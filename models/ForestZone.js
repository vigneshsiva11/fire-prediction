import mongoose from 'mongoose';

const forestZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  radiusKm: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  regionCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

forestZoneSchema.index({ regionCode: 1 }, { unique: true });

const ForestZone = mongoose.model('ForestZone', forestZoneSchema);

export default ForestZone;
