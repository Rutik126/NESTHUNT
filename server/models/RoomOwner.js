const mongoose = require('mongoose');

const RoomOwnerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  profilePhoto: { type: String },
  location: { type: String, required: true },
  properties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
}, { timestamps: true });

module.exports = mongoose.model('RoomOwner', RoomOwnerSchema);