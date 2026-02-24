import mongoose from 'mongoose';

const riskLogSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  riskScore: {
    type: Number,
    required: true,
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['Low', 'Moderate', 'High', 'Critical'],
  },
  confidenceScore: {
    type: Number,
    required: true,
  },
  contributingFactors: {
    type: [String],
    required: true,
    default: [],
  },
  explanation: {
    type: String,
    required: true,
  },
  recommendedAction: {
    type: String,
    required: true,
  },
  environmentalSnapshot: {
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    windSpeed: { type: Number, required: true },
    drynessIndex: { type: Number, required: true },
    heatIndex: { type: Number, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

riskLogSchema.index({ latitude: 1, longitude: 1, createdAt: -1 });

const RiskLog = mongoose.model('RiskLog', riskLogSchema);

export default RiskLog;
