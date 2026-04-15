const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
require('dotenv').config();

const { User, Service, Appointment } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointly';

// ===================== MONGODB CONNECTION =====================
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// Initialize default services
const defaultServices = [
  { name: 'General Consultation', duration: 30, price: 500, color: '#4F8EF7', icon: '🩺' },
  { name: 'Health Checkup', duration: 60, price: 1200, color: '#10C9A0', icon: '💊' },
  { name: 'Dental Care', duration: 45, price: 800, color: '#FF6B6B', icon: '🦷' },
  { name: 'Eye Examination', duration: 30, price: 600, color: '#A78BFA', icon: '👁️' },
  { name: 'Physiotherapy', duration: 60, price: 1000, color: '#F59E0B', icon: '🏃' },
  { name: 'Nutrition Counseling', duration: 45, price: 700, color: '#34D399', icon: '🥗' },
];

// Initialize services on startup
mongoose.connection.on('connected', async () => {
  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.insertMany(defaultServices);
    console.log('✅ Default services initialized');
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'appointly-secret-2024',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongoUrl: MONGODB_URI }),
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Middleware to pass user to all routes
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// ===================== API ROUTES =====================

// Auth Routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.json({ success: false, message: 'All fields required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'Email already registered' });
    }
    
    const user = new User({
      name,
      email,
      password,
      phone: phone || '',
      role: 'user'
    });
    
    await user.save();
    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
    res.json({ success: true, message: 'Registered successfully', user: req.session.user });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    
    if (!user) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }
    
    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
    res.json({ success: true, message: 'Login successful', user: req.session.user });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/me', (req, res) => {
  res.json({ user: req.session.user || null });
});

// Services
app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find();
    res.json({ success: true, services });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Appointments
app.get('/api/appointments', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({ success: false, message: 'Not authenticated' });
    }
    
    let query = {};
    if (req.session.user.role !== 'admin') {
      query = { userId: req.session.user._id };
    }
    
    const appointments = await Appointment.find(query)
      .populate('userId', 'name email')
      .populate('serviceId')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, appointments });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({ success: false, message: 'Not authenticated' });
    }
    
    const { serviceId, date, time, notes } = req.body;
    if (!serviceId || !date || !time) {
      return res.json({ success: false, message: 'All fields required' });
    }
    
    // Check for conflicts
    const conflict = await Appointment.findOne({
      date,
      time,
      status: { $ne: 'cancelled' }
    });
    
    if (conflict) {
      return res.json({ success: false, message: 'This time slot is already booked' });
    }
    
    const appointment = new Appointment({
      userId: req.session.user._id,
      serviceId,
      date,
      time,
      notes: notes || '',
      status: 'pending'
    });
    
    await appointment.save();
    const populatedAppt = await Appointment.findById(appointment._id)
      .populate('userId', 'name email')
      .populate('serviceId');
    
    res.json({ success: true, appointment: populatedAppt });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.put('/api/appointments/:id', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({ success: false, message: 'Not authenticated' });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' });
    }
    
    if (appointment.userId.toString() !== req.session.user._id.toString() && 
        req.session.user.role !== 'admin') {
      return res.json({ success: false, message: 'Unauthorized' });
    }
    
    const { status, date, time, notes } = req.body;
    if (status) appointment.status = status;
    if (date) appointment.date = date;
    if (time) appointment.time = time;
    if (notes !== undefined) appointment.notes = notes;
    appointment.updatedAt = new Date();
    
    await appointment.save();
    const updatedAppt = await Appointment.findById(appointment._id)
      .populate('userId', 'name email')
      .populate('serviceId');
    
    res.json({ success: true, appointment: updatedAppt });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({ success: false, message: 'Not authenticated' });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.json({ success: false, message: 'Not found' });
    }
    
    if (appointment.userId.toString() !== req.session.user._id.toString() && 
        req.session.user.role !== 'admin') {
      return res.json({ success: false, message: 'Unauthorized' });
    }
    
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Available time slots
app.get('/api/slots', async (req, res) => {
  try {
    const { date } = req.query;
    const allSlots = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];
    
    const booked = await Appointment.find({
      date,
      status: { $ne: 'cancelled' }
    }).select('time');
    
    const bookedTimes = booked.map(a => a.time);
    const available = allSlots.map(slot => ({ time: slot, available: !bookedTimes.includes(slot) }));
    
    res.json({ success: true, slots: available });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Stats for dashboard
app.get('/api/stats', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({ success: false });
    }
    
    let query = {};
    if (req.session.user.role !== 'admin') {
      query = { userId: req.session.user._id };
    }
    
    const appointments = await Appointment.find(query);
    const today = new Date().toISOString().split('T')[0];
    
    res.json({
      success: true,
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      today: appointments.filter(a => a.date === today).length
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Serve the SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Appointly running on http://localhost:${PORT}`);
});

module.exports = app;
