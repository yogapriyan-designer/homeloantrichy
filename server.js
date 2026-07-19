require('dotenv').config();
require('./db');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const enquiryRoutes = require('./routes/enquiry');
const googleAuthRoutes = require('./routes/google-auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/enquiry', enquiryRoutes);
app.use('/api/auth/google', googleAuthRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));