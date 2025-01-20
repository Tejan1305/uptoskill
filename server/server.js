require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the app and middlewares
const app = express();
const PORT = process.env.PORT || 5000;
const genAI = new GoogleGenerativeAI(process.env.Gemini_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/latex-editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Define a schema for templates
const templateSchema = new mongoose.Schema({
  title: String,
  content: String,
  aiSuggestions: [String],
  updatedAt: { type: Date, default: Date.now }
});

const Template = mongoose.model('Template', templateSchema);

// Upload template files
const upload = multer({ dest: 'uploads/' });
app.post('/api/templates', upload.single('file'), async (req, res, next) => {
  try {
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const newTemplate = new Template({
      title: req.file.originalname,
      content: fileContent,
      aiSuggestions: []
    });

    await newTemplate.save();
    res.json(newTemplate);
  } catch (error) {
    next(error);
  }
});

// Fetch all templates
app.get('/api/templates', async (req, res, next) => {
  try {
    const templates = await Template.find();
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

// Get AI suggestions using Gemini
app.post('/api/convert', async (req, res, next) => {
  try {
    const { content } = req.body;
    const prompt = `Provide suggestions for improving the following content:\n${content}`;
    const result = await model.generateContent(prompt);

    if (result && result.response && result.response.text) {
      res.json({ suggestions: result.response.text });
    } else {
      res.status(500).json({ message: 'Failed to generate AI suggestions.' });
    }
  } catch (error) {
    next(error);
  }
});

// Save updated template
app.put('/api/templates/:id', async (req, res, next) => {
  try {
    const { content } = req.body;
    const { id } = req.params;

    const updatedTemplate = await Template.findByIdAndUpdate(
      id,
      { content, updatedAt: Date.now() },
      { new: true }
    );

    res.json(updatedTemplate);
  } catch (error) {
    next(error);
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'An unexpected error occurred.' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
