const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadToCloudinary = async (filePath) => {
  try {
    console.log("Uploading to Cloudinary:", filePath);
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'menu_logos',
      resource_type: 'auto' // Automatically detect file type
    });
    console.log("Cloudinary upload success:", result.secure_url);
    fs.unlink(filePath, () => {}); // delete temp file
    return result;
  } catch (err) {
    console.error('Cloudinary error:', err);
    throw err;
  }
};

module.exports = { uploadToCloudinary };
