const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

// Service Schema
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  color: { type: String },
  icon: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Service: mongoose.model('Service', serviceSchema),
  Appointment: mongoose.model('Appointment', appointmentSchema)
};
