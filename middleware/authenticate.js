const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, 'YARED', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.userId = decoded.userId;
    next();
  });
};

 module.exports = authenticate;
// const jwt = require('jsonwebtoken');
// const db = require('../db'); // Adjust the path to your MySQL connection

// const authenticate = async (req, res, next) => {
//   const token = req.headers['authorization']?.split(' ')[1];
//   if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Check if the token is in the blacklist
//     const [rows] = await db.execute('SELECT * FROM token_blacklist WHERE token = ?', [token]);
//     if (rows.length > 0) return res.status(401).json({ success: false, message: 'Token is invalidated' });

//     req.userId = decoded.userId;
//     next();
//   } catch (err) {
//     res.status(401).json({ success: false, message: 'Invalid token' });
//   }
// };

// module.exports = authenticate;
