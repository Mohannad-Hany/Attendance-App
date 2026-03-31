require('dotenv').config();
const express = require('express');
const cors = require('cors');

const gradesRouter = require('./routes/grades');
const studentsRouter = require('./routes/students');
const attendanceRouter = require('./routes/attendance');
const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Routes
app.use('/api/grades', gradesRouter);
app.use('/api/students', studentsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/reports', reportsRouter);

app.listen(PORT, () => {
  console.log(`✅ Attendance server running on http://localhost:${PORT}`);
});
