const express = require('express');
const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RoomOwner = require('../models/RoomOwner');
const multer = require('multer');
const router = express.Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Mask phone number (e.g., 1234567890 -> XXXXXXX890)
const maskPhoneNumber = (phone) => {
  return phone.replace(/\d(?=\d{3})/g, 'X'); // Replace all digits except the last 3 with 'X'
};


router.get('/profile',auth, async (req, res) => {
  try {
    console.log('Request User:', req.user); // Log the user object
    const userId = req.user._id;

    const roomOwner = await RoomOwner.findById(userId);
    if (!roomOwner) {
      return res.status(404).json({ message: 'Room Owner not found' });
    }

    console.log('Fetched Room Owner:', roomOwner); // Log the fetched room owner
    res.status(200).json(roomOwner);
  } catch (err) {
    console.error('Error fetching room owner profile:', err);
    res.status(500).json({ message: 'Error fetching room owner profile', error: err.message });
  }
});

// const upload = multer({ storage });

// Login User or RoomOwner
router.post('/login', (req, res, next) => {
  const { email, password, userType } = req.body;

  // Determine the strategy based on userType
  const strategy = userType === 'user' ? 'user-local' : 'roomowner-local';

  passport.authenticate(strategy, async (err, user, info) => {
    if (err) {
      console.error('Authentication Error:', err); // Log the error
      return res.status(500).json({ message: 'Error during authentication', error: err.message });
    }
    if (!user) {
      console.error('User Not Found or Incorrect Password:', info); // Log the failure
      return res.status(401).json({ message: info.message });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, userType }, // Include userId and userType
      'your-secret-key',
      { expiresIn: '1h' }
    );

    // Log the successful login
    console.log('Login Successful:', user);

    // Send success response with token
    res.status(200).json({ message: 'Login successful', token , userType });
  })(req, res, next);
});

// Register User  
router.post('/register', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    const profilePhoto = req.file ? req.file.path : null;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Mask the phone number
    const maskedPhone = maskPhoneNumber(phone);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword, // Store hashed password
      phone: maskedPhone, // Store masked phone number
      profilePhoto,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Room Owner Registration Route
router.post('/register-roomowner', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { username, email, password, phone, location } = req.body;
    
    // Check if required fields are present
    if (!username || !email || !password || !phone || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await RoomOwner.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new room owner
    const newRoomOwner = new RoomOwner({
      username,
      email,
      password: hashedPassword,
      phone,
      location,
      profilePhoto: req.file?.path
    });

    await newRoomOwner.save();

    res.status(201).json({ 
      message: 'Room owner registered successfully',
      user: {
        id: newRoomOwner._id,
        username: newRoomOwner.username,
        email: newRoomOwner.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error destroying session' });
      }
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Logout successful' });
    });
  });
});

// Check if the user is logged in
router.get('/check', (req, res) => {
  if (req.isAuthenticated()) {
    const userType = req.user instanceof User ? 'user' : 'roomowner'; // Determine user type
    return res.status(200).json({ 
      isLoggedIn: true, 
      user: req.user, 
      userType // Include userType in the response
    });
  }
  res.status(200).json({ isLoggedIn: false });
});

module.exports = router;