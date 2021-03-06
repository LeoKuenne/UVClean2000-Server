const mongoose = require('mongoose');

const user = new mongoose.Schema({
  username: { type: String, required: true },
  canEdit: { type: Boolean, default: false },
});

const userModel = mongoose.model('User', user);

module.exports = userModel;
