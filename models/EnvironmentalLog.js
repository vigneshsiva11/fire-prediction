import mongoose from 'mongoose';

const environmentalLogSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  temperature: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
  },
  windSpeed: {
    type: Number,
    required: true,
  },
  pressure: {
    type: Number,
    required: true,
  },
  drynessIndex: {
    type: Number,
    required: true,
  },
  heatIndex: {
    type: Number,
    required: true,
  },
  weatherDescription: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
    default: 'openweathermap',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

environmentalLogSchema.index({ latitude: 1, longitude: 1, createdAt: -1 });

const EnvironmentalLog = mongoose.model('EnvironmentalLog', environmentalLogSchema);

export default EnvironmentalLog;
