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
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Passport Local Strategy for User
passport.use('user-local', new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'User not found' });
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password' });
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Passport Local Strategy for RoomOwner
passport.use('roomowner-local', new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const roomOwner = await RoomOwner.findOne({ email });
      if (!roomOwner) return done(null, false, { message: 'Room owner not found' });
      
      const isMatch = await bcrypt.compare(password, roomOwner.password);
      if (!isMatch) return done(null, false, { message: 'Incorrect password' });
      
      return done(null, roomOwner);
    } catch (err) {
      return done(err);
    }
  }
));

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

// In-memory storage for OTPs (in production, use Redis or database)
const otpStore = new Map();

// Generate random OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Configure Twilio (optional - for SMS OTP)
// const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Configure nodemailer (optional - for email OTP)
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

const maskPhoneNumber = (phone) => phone.replace(/\d(?=\d{3})/g, 'X');

// New route to send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, email } = req.body;
    
    if (!phone && !email) {
      return res.status(400).json({ message: 'Phone or email is required' });
    }

    const otp = generateOTP();
    const identifier = phone || email;
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(identifier, {
      otp,
      expiresAt: Date.now() + 300000 // 5 minutes
    });

    // For production: Send OTP via SMS or email
    if (phone) {
      // Uncomment to actually send SMS (requires Twilio account)
      // await twilioClient.messages.create({
      //   body: `Your OTP is: ${otp}`,
      //   from: process.env.TWILIO_PHONE,
      //   to: phone
      // });
      console.log(`OTP for ${phone}: ${otp}`); // For development only
    } else if (email) {
      // Uncomment to actually send email
      // await transporter.sendMail({
      //   from: process.env.EMAIL_USER,
      //   to: email,
      //   subject: 'Your OTP Code',
      //   text: `Your OTP is: ${otp}`
      // });
      console.log(`OTP for ${email}: ${otp}`); // For development only
    }

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending OTP', error: err.message });
  }
});

// New route to verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, email, otp } = req.body;
    const identifier = phone || email;

    if (!identifier || !otp) {
      return res.status(400).json({ message: 'Phone/email and OTP are required' });
    }

    const storedOtp = otpStore.get(identifier);

    if (!storedOtp || storedOtp.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (Date.now() > storedOtp.expiresAt) {
      otpStore.delete(identifier);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    otpStore.set(identifier, { ...storedOtp, verified: true });
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying OTP', error: err.message });
  }
});

// Modify the register route to check for verified OTP
router.post('/register', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    const identifier = phone || email;
    const storedOtp = otpStore.get(identifier);

    if (!storedOtp?.verified) {
      return res.status(400).json({ message: 'Phone/email not verified with OTP' });
    }

    const profilePhoto = req.file?.path;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      phone: maskPhoneNumber(phone),
      profilePhoto,
      isPhoneVerified: !!phone,
      isEmailVerified: !!email
    });

    await user.save();
    otpStore.delete(identifier);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Similarly modify the room owner registration route
router.post('/register-roomowner', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { username, email, password, phone, location } = req.body;
    const identifier = phone || email;
    const storedOtp = otpStore.get(identifier);

    if (!storedOtp?.verified) {
      return res.status(400).json({ message: 'Phone/email not verified with OTP' });
    }

    if (!username || !email || !password || !phone || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await RoomOwner.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newRoomOwner = new RoomOwner({
      username,
      email,
      password: hashedPassword,
      phone,
      location,
      profilePhoto: req.file?.path,
      isPhoneVerified: !!phone,
      isEmailVerified: !!email
    });

    await newRoomOwner.save();
    otpStore.delete(identifier);

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

// Login User or RoomOwner
router.post('/login', (req, res, next) => {
  const { email, password, userType } = req.body;

  // Determine the strategy based on userType
  const strategy = userType === 'user' ? 'user-local' : 'roomowner-local';

  passport.authenticate(strategy, async (err, user, info) => {
    if (err) {
      console.error('Authentication Error:', err);
      return res.status(500).json({ message: 'Error during authentication', error: err.message });
    }
    if (!user) {
      console.error('User Not Found or Incorrect Password:', info);
      return res.status(401).json({ message: info.message });
    }

    // Check if user is verified (either phone or email)
    const isVerified = user.isPhoneVerified || user.isEmailVerified;
    if (!isVerified) {
      return res.status(403).json({ message: 'Account not verified. Please complete OTP verification.' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, userType },
      'your-secret-key',
      { expiresIn: '1h' }
    );

    console.log('Login Successful:', user);
    res.status(200).json({ message: 'Login successful', token, userType });
  })(req, res, next);
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