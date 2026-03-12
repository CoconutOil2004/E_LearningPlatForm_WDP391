const express = require("express");
const router = express.Router();
const { uploadImages, uploadVideo } = require("../controller/uploadController");
const { protect } = require("../middleware/authMiddleware");
const uploadImagesMw = require("../middleware/uploadImages");
const uploadVideoMw = require("../middleware/uploadVideo");
const handleImagesError = uploadImagesMw.handleUploadError;
const handleVideoError = uploadVideoMw.handleUploadError;

/** Tất cả upload Cloudinary: ảnh (nhiều) + video (một) */

router.post("/images", protect, uploadImagesMw, handleImagesError, uploadImages);
router.post("/video", protect, uploadVideoMw, handleVideoError, uploadVideo);

module.exports = router;
