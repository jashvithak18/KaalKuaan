require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDefaultData = require('./utils/seedData');
const Well = require('./models/Well');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(async () => {
  // Check if initial data is present; if not, auto-seed
  try {
    const count = await Well.countDocuments();
    if (count === 0) {
      console.log('[AUTO-SEED] Empty database detected. Populating demo datasets...');
      await seedDefaultData();
    }
  } catch (err) {
    console.error('[AUTO-SEED ERROR]', err.message);
  }
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
    system: 'KAAL KUAAN — Public Borewell Safety Network',
    jurisdiction: 'Nalgonda District, Telangana',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/wells', require('./routes/wellRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/compliance', require('./routes/complianceRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/demo', require('./routes/demoRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

const path = require('path');
const fs = require('fs');

// Serve frontend SPA build if present (enables single-service monolith deployment)
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`[SERVER] Kaal Kuaan Core Safety Network active on port ${PORT}`);
});
