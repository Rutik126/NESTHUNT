// const express = require('express');
// const auth = require('../middleware/auth'); // Import auth middleware
// const Apartment = require('../models/Apartment');

// const router = express.Router();

// // Fetch Apartments (Protected Route)
// router.get('/', auth, async (req, res) => {
//   try {
//     const apartments = await Apartment.find();
//     res.status(200).json(apartments);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching apartments', error: err.message });
//   }
// });

// // Add Apartment (Protected Route)
// router.post('/', auth, async (req, res) => {
//   try {
//     const { name, location, description } = req.body;
//     const apartment = new Apartment({ name, location, description });
//     await apartment.save();
//     res.status(201).json({ message: 'Apartment added', apartment });
//   } catch (err) {
//     res.status(500).json({ message: 'Error adding apartment', error: err.message });
//   }
// });

// module.exports = router;