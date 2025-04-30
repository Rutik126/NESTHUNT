const express = require('express');
const Property = require('../models/Property');
const RoomOwner = require('../models/RoomOwner');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ensureUploadsDir } = require('../utils/fileUpload');
const router = express.Router();

ensureUploadsDir('properties');

const uploadDir = path.join(process.cwd(), 'temp_uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/properties');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB per file, max 5 files
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// Toggle property vacancy status
router.patch('/:id/vacancy', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'roomowner') {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      { vacant: req.body.vacant },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({
      success: true,
      property: {
        _id: property._id,
        vacant: property.vacant
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating vacancy status',
      error: err.message
    });
  }
});


// Get all public properties
// In GET /api/properties/ endpoint
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find({})
      .populate('owner', 'username email phone');

    // Process properties with complete image URLs
    const processedProperties = properties.map(property => {
      const propertyObj = property.toObject();
      
      // Convert images to full URLs
      propertyObj.images = propertyObj.images.map(img => 
        img.startsWith('http') ? img : `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${img}`
      );
      
      // Convert mainImage to full URL
      propertyObj.mainImage = propertyObj.mainImage?.startsWith('http') 
        ? propertyObj.mainImage 
        : `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${propertyObj.mainImage}`;
      
      return propertyObj;
    });

    res.json({
      success: true,
      properties: processedProperties
    });
  } catch (err) {
    // error handling
  }
});


// Add new property
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Parse location data
    let locationData;
    try {
      locationData = JSON.parse(req.body.location);
    } catch (e) {
      locationData = { address: req.body.location };
    }

    // Create array of image paths
    const images = req.files.map(file => `/uploads/properties/${file.filename}`);

    const property = new Property({
      name: req.body.name,
      location: locationData,
      price: req.body.price,
      type: req.body.type,
      description: req.body.description,
      images, // Store array of images
      mainImage: images[0], // Store first image as main image
      owner: req.user.userId
    });

    await property.save();
    
    // Update room owner's properties array
    await RoomOwner.findByIdAndUpdate(req.user.userId, {
      $push: { properties: property._id }
    });

    res.status(201).json({ 
      success: true,
      property: {
        ...property._doc,
        images: images.map(img => `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${img}`)
      }
    });
  } catch (err) {
    console.error('Error adding property:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error adding property',
      error: err.message 
    });
  }
});

// routes/properties.js
router.get('/:id/owner', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'phone');
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({
      success: true,
      phone: property.owner.phone
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching owner info',
      error: err.message
    });
  }
});

// Get owner's properties
router.get('/my-properties', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'roomowner') {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    const properties = await Property.find({ owner: req.user.userId })
      .select('-__v -owner -createdAt -updatedAt');

    // Enhance properties with full image URLs
    const enhancedProperties = properties.map(property => ({
      ...property._doc,
      images: property.images.map(img => `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/${img.replace(/^\/+/, '')}`),
      mainImage: property.mainImage ? `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/${property.mainImage.replace(/^\/+/, '')}` : null
    }));

    res.json({ 
      success: true,
      properties: enhancedProperties
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
});


module.exports = router;