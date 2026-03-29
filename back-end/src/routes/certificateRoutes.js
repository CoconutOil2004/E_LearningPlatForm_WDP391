const express = require("express");
const router = express.Router();
const {
  getPendingCertificates,
  getAllCertificates,
  approveCertificate,
  rejectCertificate,
  getMyCertificates,
  getCertificateStatus,
} = require("../controller/certificateController");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/authorize");

// Student routes
router.get("/my", protect, getMyCertificates);
router.get("/status/:courseId", protect, getCertificateStatus);

// Admin routes
router.get("/pending", protect, authorize("admin"), getPendingCertificates);
router.get("/all", protect, authorize("admin"), getAllCertificates);
router.post("/:enrollmentId/approve", protect, authorize("admin"), approveCertificate);
router.post("/:enrollmentId/reject", protect, authorize("admin"), rejectCertificate);

module.exports = router;
