const { cloudinary } = require("../config/cloudinary");

/** Upload image buffer to Cloudinary, returns { url, publicId } */
function uploadImageBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "elearning-images" },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );
    uploadStream.end(buffer);
  });
}

/** Upload video buffer to Cloudinary, returns { videoUrl, publicId, duration } */
function uploadVideoBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "video", folder: "elearning-videos" },
      (err, result) => {
        if (err) return reject(err);
        const duration = result?.duration ? Math.round(Number(result.duration)) : 0;
        resolve({
          videoUrl: result.secure_url,
          publicId: result.public_id,
          duration
        });
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * POST /api/upload/images – upload multiple images at once (multipart, field: images)
 * Returns { success, data: [ { url, publicId }, ... ] }
 */
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "Please send at least one image file (field: images)." });
    }
    const results = await Promise.all(
      req.files.map((file) => uploadImageBufferToCloudinary(file.buffer))
    );
    res.json({ success: true, message: "Images uploaded successfully.", data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Image upload failed." });
  }
};

/**
 * POST /api/upload/video – upload a video (multipart, field: video)
 * Returns { success, data: { videoUrl, publicId, duration } }
 */
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: "Video file is required (field: video)." });
    }
    const data = await uploadVideoBufferToCloudinary(req.file.buffer);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Video upload failed." });
  }
};
