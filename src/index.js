const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const recordsRouter = require('./routes/records');
const authRouter    = require('./routes/auth');
const accountsRouter= require('./routes/accounts');
const app  = express();
const PORT = process.env.PORT || 3001;

// Parse incoming JSON request bodies
app.use(express.json());

// Allow requests from the React dev server (localhost:5173)
// In production, replace the origin with your actual domain
app.use(cors({ origin: 'http://localhost:5173' }));

// Mount the records API at /api/records
app.use('/api/records', recordsRouter);
app.use('/api/auth', authRouter);
app.use('/api/accounts', accountsRouter);
// Health check route
app.get('/', (req, res) => res.json({ status: 'Finance API running' }));

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
