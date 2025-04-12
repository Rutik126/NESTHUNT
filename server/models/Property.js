const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { 
    type: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    required: true
  },
  price: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['PG', 'Hostel', 'Apartment', 'House'], 
    required: true 
  },
  description: { type: String, required: true },
  images: [{ 
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one image is required'
    }
  }], // Array of image paths
  mainImage: {
    type: String,
    required: true
  }, // Main image path
  vacant: { type: Boolean, default: true },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RoomOwner', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);