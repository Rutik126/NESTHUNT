const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password
  phone: { type: String, required: true }, // Masked phone number
  profilePhoto: { type: String }, // Path to the uploaded file
  savedProperties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
});

module.exports = mongoose.model('User', UserSchema);