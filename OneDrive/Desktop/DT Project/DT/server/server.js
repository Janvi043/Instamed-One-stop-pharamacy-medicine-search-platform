const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pharmacy', require('./routes/pharmacy'));
app.use('/api/user', require('./routes/user'));
app.use('/api/medicine', require('./routes/medicine'));
app.use('/api/search', require('./routes/search'));

// Root API route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'InstaMed API is running!', 
    status: 'OK',
    endpoints: {
      health: '/api/health',
      auth: {
        userRegister: '/api/auth/user/register',
        userLogin: '/api/auth/user/login',
        pharmacyLogin: '/api/auth/pharmacy/login'
      },
      user: '/api/user/*',
      pharmacy: '/api/pharmacy/*',
      medicine: '/api/medicine/*',
      search: '/api/search/*'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'InstaMed API is running!', status: 'OK' });
});

// Connect to MongoDB (local MongoDB Server for Compass)
mongoose
  .connect('mongodb://localhost:27017/instamed')
  .then(() => {
    console.log('✅ MongoDB Connected Successfully (local)');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 InstaMed Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}/api`);
});

