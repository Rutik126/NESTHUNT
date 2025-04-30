const express = require('express');
require('dotenv').config(); 
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const RoomOwner = require('./models/RoomOwner'); // Import RoomOwner model
// const apartmentRoutes = require('./routes/apartments');
const propertiesRoutes = require('./routes/properties');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const uploads = multer({ dest: path.join(__dirname, 'uploads') });
const roomOwnerRoutes = require('./routes/roomOwner');
const userRoutes = require('./routes/user');
const uploadDir = path.join(__dirname, 'uploads');
const bcrypt = require('bcrypt');

const app = express();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('MongoDB connection error:', err));

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware
app.use(cors({ credentials: true, origin: 'http://localhost:3000' })); // Allow frontend to send credentials
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
  })
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (ext === '.png') {
      res.setHeader('Content-Type', 'image/png');
    }
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Helper function to determine content type
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy for User authentication
passport.use(
  'user-local',
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return done(null, false, { message: 'Incorrect password' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Passport Local Strategy for RoomOwner authentication
passport.use(
  'roomowner-local',
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const roomOwner = await RoomOwner.findOne({ email });
      if (!roomOwner) {
        return done(null, false, { message: 'RoomOwner not found' });
      }

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, roomOwner.password);
      if (!isPasswordValid) {
        return done(null, false, { message: 'Incorrect password' });
      }

      return done(null, roomOwner);
    } catch (err) {
      return done(err);
    }
  })
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, { id: user.id, type: user instanceof User ? 'user' : 'roomowner' });
});

passport.deserializeUser(async (data, done) => {
  try {
    let user;
    if (data.type === 'user') {
      user = await User.findById(data.id);
    } else if (data.type === 'roomowner') {
      user = await RoomOwner.findById(data.id);
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
});


app.get('/', (req, res) => {
  res.send('Backend is running');
});


// require('dotenv').config();

// Routes
app.use('/api/user', userRoutes);
app.use('/api/roomowner', roomOwnerRoutes);
// app.use('/api/roomowner', RoomOwnerRoutes);
app.use('/api/auth', authRoutes);
// app.use('/api/apartments', apartmentRoutes);
app.use('/api/properties', propertiesRoutes);





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});