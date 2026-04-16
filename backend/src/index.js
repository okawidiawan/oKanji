const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { userRouter } = require('./routes/user-route');
const { userKanjiRouter } = require('./routes/user-kanji-route');
const { errorMiddleware } = require('./error/error-middleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// User routes
app.use(userRouter);
app.use(userKanjiRouter);

// Error middleware (must be after routes)
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app };
