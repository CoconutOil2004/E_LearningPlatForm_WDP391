const multer = require("multer");

/** Multer memory storage cho file video (upload lên Cloudinary trong controller) */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
  if (file.mimetype && allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file video (mp4, webm, mov, avi)"), false);
  }
};

const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }
}).single("video");

/** Middleware bắt lỗi multer (sai loại file, quá dung lượng) */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "File video vượt quá dung lượng cho phép." });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message || "Lỗi upload file." });
  }
  next();
};

module.exports = uploadVideo;
module.exports.handleUploadError = handleUploadError;
