const cloudinary = require("cloudinary").v2;

// CLOUDINARY_URL: cloudinary://api_key:api_secret@cloud_name
cloudinary.config({
  secure: true
});

module.exports = {
  cloudinary
};
