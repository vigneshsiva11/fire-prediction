import mongoose from 'mongoose';

const loginLogSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  ipAddress: {
    type: String,
    default: 'unknown',
  },
  userAgent: {
    type: String,
    default: 'unknown',
  },
  loginTime: {
    type: Date,
    default: Date.now,
  },
});

const LoginLog = mongoose.model('LoginLog', loginLogSchema);

export default LoginLog;
