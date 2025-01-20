const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  title: String,
  content: String,
  aiSuggestions: [{
    original: String,
    suggestion: String,
    type: String,
    timestamp: { type: Date, default: Date.now }
  }],
  versions: [{
    content: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);