const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const authenticate = require('./middleware/authenticate');

const app = express();

app.use(express.json());
app.use(cors());

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'This is a protected route', userId: req.userId });
});

// Connect to MongoDB and start server
mongoose.connect('mongodb://localhost:27017/your-database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  app.listen(5000, () => {
    console.log('Server is running on port 5000');
  });
}).catch(err => {
  console.error(err);
});
