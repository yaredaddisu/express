const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate'); // Adjust the path to your authenticate middleware
const db = require('../db'); // Adjust the path to your MySQL connection
const jwt = require('jsonwebtoken');

// Route to get the logged-in user's information
router.get('/user', authenticate, async (req, res) => {
    try {
      const userId = req.userId;
  
      // Fetch user details from the database
      const [rows] = await db.execute('SELECT id, email, role, firstName, lastName, chat_id FROM users WHERE id = ?', [userId]);
  
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const user = rows[0];
      res.status(200).json({
        success: true,
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        chat_id: user.chat_id,
      });
    } catch (err) {
      console.error('Error fetching user:', err); // Log the error for debugging
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
  router.get('/userToken', authenticate, async (req, res) => {
    try {
      const userId = req.userId;
  
      // Fetch user details from the database
      const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
  
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const user = rows[0];
     
    // Generate token
    const token = jwt.sign({ userId: user.id, chatId: user.chat_id, user: user }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send response with user details and token
    res.status(200).json({
      success: true,
      token
    });
    } catch (err) {
      console.error('Error fetching user:', err); // Log the error for debugging
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
module.exports = router;
