const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Adjust the path to your MySQL connection

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
    res.status(201).json({ success: true, message: 'User registered' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send response with user details and token
    res.status(200).json({
      success: true,
      token,
    
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName ,
        chat_id: user.chat_id,

     
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send response with user details and token
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,

      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login Route
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     if (!email || !password) {
//       return res.status(400).json({ success: false, message: 'email and password are required' });
//     }

//     // Find user
//     const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
//     const user = rows[0];
//     if (!user) return res.status(400).json({ success: false, message: 'User not found' });

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

//     // Generate token
//     const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.status(200).json({ success: true, token });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
 
// Logout Route
router.get('/logout', (req, res) => {
  // Client-side token removal
  // The server typically does not have direct access to invalidate tokens unless you are managing a token blacklist.
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
