const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Create directories if they don't exist
if (!fs.existsSync('./public/images')) {
  fs.mkdirSync('./public/images');
}

// Set up Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve static files (like images) from public folder
app.use(express.static('public'));

// Handle GET requests to display the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle POST request for file uploads
app.post('/upload', upload.fields([{ name: 'topwearImages', maxCount: 10 }, { name: 'bottomwearImages', maxCount: 10 }]), (req, res) => {
  if (!req.files || !req.files.topwearImages || !req.files.bottomwearImages) {
    return res.status(400).send('Please upload at least one topwear and one bottomwear image.');
  }

  // Send back file paths for both topwear and bottomwear images
  const topwearImages = req.files.topwearImages.map(file => `/images/${file.filename}`);
  const bottomwearImages = req.files.bottomwearImages.map(file => `/images/${file.filename}`);
  
  res.json({ topwearImages, bottomwearImages });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
