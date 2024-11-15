const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp'); // Import sharp for image resizing
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
app.post('/upload', upload.array('clothingImages', 2), async (req, res) => {
  if (!req.files || req.files.length < 2) {
    return res.status(400).send('Please upload at least one topwear and one bottomwear image.');
  }

  try {
    const resizedImages = [];
    for (const file of req.files) {
      // Resize image to 400px wide (height auto to maintain aspect ratio)
      const resizedImagePath = `./public/images/resized_${file.filename}`;
      await sharp(file.path)
        .resize(400) // Resize to 400px width
        .toFile(resizedImagePath);

      // Add the resized image path to the response
      resizedImages.push(`/images/${path.basename(resizedImagePath)}`);
      
      // Delete the original uploaded file to save space
      fs.unlinkSync(file.path);
    }

    // Return the paths of the resized images
    res.json({ images: resizedImages });
  } catch (err) {
    console.error('Error resizing images:', err);
    res.status(500).send('Server error while processing the images.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
