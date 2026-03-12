const { cloudinary } = require("../config/cloudinary");

/** Upload buffer ảnh lên Cloudinary, trả về { url, publicId } */
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

/** Upload buffer video lên Cloudinary, trả về { videoUrl, publicId, duration } */
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
 * POST /api/upload/images – nhận nhiều ảnh một lúc (multipart, field: images)
 * Trả về { success, data: [ { url, publicId }, ... ] }
 */
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Cần gửi ít nhất một file ảnh (field: images)." });
    }
    const results = await Promise.all(
      req.files.map((file) => uploadImageBufferToCloudinary(file.buffer))
    );
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ message: err.message || "Upload ảnh thất bại." });
  }
};

/**
 * POST /api/upload/video – nhận một video (multipart, field: video)
 * Trả về { success, data: { videoUrl, publicId, duration } }
 */
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "Cần gửi file video (field: video)." });
    }
    const data = await uploadVideoBufferToCloudinary(req.file.buffer);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: err.message || "Upload video thất bại." });
  }
};
