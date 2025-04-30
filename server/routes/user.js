const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Enhanced User Profile Endpoint
router.get('/profile', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'user') {
      return res.status(403).json({ message: 'Access denied. User endpoint only' });
    }

    const user = await User.findById(req.user.userId)
      .populate('savedProperties', 'name price type images') // Populate with needed fields
      .select('username email phone profilePhoto createdAt savedProperties')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process images to include full URLs
    if (user.savedProperties) {
      user.savedProperties = user.savedProperties.map(property => ({
        ...property,
        mainImage: property.images?.[0] 
          ? `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}${property.images[0]}` 
          : '/default-property.jpg'
      }));
    }

    res.status(200).json({ 
      success: true,
      data: { user }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: err.message 
    });
  }
});

// routes/user.js
router.delete('/remove-saved-property', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'user') {
      return res.status(403).json({ message: 'Access denied. User endpoint only' });
    }

    const { propertyId } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $pull: { savedProperties: propertyId } },
      { new: true }
    ).populate('savedProperties', 'name price type images');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      savedProperties: user.savedProperties
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error removing saved property',
      error: err.message
    });
  }
});

router.post('/save-property', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'user') {
      return res.status(403).json({ message: 'Access denied. User endpoint only' });
    }

    const { propertyId } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $addToSet: { savedProperties: propertyId } }, // $addToSet prevents duplicates
      { new: true }
    ).populate('savedProperties');

    res.status(200).json({
      success: true,
      savedProperties: user.savedProperties
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error saving property',
      error: err.message
    });
  }
});

module.exports = router;