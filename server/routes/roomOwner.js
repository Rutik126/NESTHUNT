const express = require('express');
const RoomOwner = require('../models/RoomOwner');
const auth = require('../middleware/auth');
const router = express.Router();

// Fetch Room Owner Profile
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('Request User:', req.user); // Log the user object
    const userId = req.user.userId; // Ensure this matches the token payload

    const roomOwner = await RoomOwner.findById(userId);
    if (!roomOwner) {
      return res.status(404).json({ message: 'Room Owner not found' });
    }

    console.log('Fetched Room Owner:', roomOwner); // Log the fetched room owner
    res.status(200).json({ roomOwner });
  } catch (err) {
    console.error('Error fetching room owner profile:', err);
    res.status(500).json({ message: 'Error fetching room owner profile', error: err.message });
  }
});

router.get('/dashboard', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'roomowner') {
      return res.status(200).json({ 
        message: 'Welcome to our platform! Upgrade to RoomOwner account to list your properties.',
        advertisement: true,
        ads: [
          {
            title: 'List Your Property',
            description: 'Reach thousands of potential tenants by listing your property with us',
            cta: 'Upgrade Now'
          }
        ]
      });
    }

    const roomOwner = await RoomOwner.findById(req.user.userId);
    res.status(200).json({ roomOwner });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;