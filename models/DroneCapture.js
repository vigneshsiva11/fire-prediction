import mongoose from 'mongoose';

const droneCaptureSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    trim: true,
  },
  droneId: {
    type: String,
    required: true,
    index: true,
  },
  image: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

droneCaptureSchema.index({ location: 1, createdAt: -1 });

const DroneCapture = mongoose.model('DroneCapture', droneCaptureSchema);

export default DroneCapture;
