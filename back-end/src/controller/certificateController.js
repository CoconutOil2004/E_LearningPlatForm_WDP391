const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const { sendNotification } = require("../utils/notificationUtils");

exports.getPendingCertificates = async (req, res) => {
  try {
    const { keyword, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    const query = {
      completed: true,
      certificateStatus: "pending"
    };

    if (dateFrom || dateTo) {
      query.updatedAt = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (!isNaN(from)) query.updatedAt.$gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        if (!isNaN(to)) {
          to.setHours(23, 59, 59, 999);
          query.updatedAt.$lte = to;
        }
      }
      if (Object.keys(query.updatedAt).length === 0) delete query.updatedAt;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    let enrollments = await Enrollment.find(query)
      .populate("userId", "fullname username email avatarURL")
      .populate({
        path: "courseId",
        select: "title thumbnail instructorId",
        populate: { path: "instructorId", select: "fullname email" }
      })
      .sort({ updatedAt: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    if (keyword && keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      enrollments = enrollments.filter(e => {
        const studentName = (e.userId?.fullname || e.userId?.username || "").toLowerCase();
        const courseTitle = (e.courseId?.title || "").toLowerCase();
        return studentName.includes(kw) || courseTitle.includes(kw);
      });
    }

    const total = await Enrollment.countDocuments(query);

    res.json({
      success: true,
      message: "Pending certificates retrieved successfully.",
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: enrollments,
    });
  } catch (error) {
    console.error("getPendingCertificates error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching pending certificates.",
    });
  }
};

exports.getAllCertificates = async (req, res) => {
  try {
    const { status, keyword, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    const query = { completed: true };

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.certificateStatus = status;
    }

    if (dateFrom || dateTo) {
      query.updatedAt = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (!isNaN(from)) query.updatedAt.$gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        if (!isNaN(to)) {
          to.setHours(23, 59, 59, 999);
          query.updatedAt.$lte = to;
        }
      }
      if (Object.keys(query.updatedAt).length === 0) delete query.updatedAt;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    let enrollments = await Enrollment.find(query)
      .populate("userId", "fullname username email avatarURL")
      .populate({
        path: "courseId",
        select: "title thumbnail instructorId",
        populate: { path: "instructorId", select: "fullname email" }
      })
      .populate("certificateApprovedBy", "fullname email")
      .sort({ updatedAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    if (keyword && keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      enrollments = enrollments.filter(e => {
        const studentName = (e.userId?.fullname || e.userId?.username || "").toLowerCase();
        const courseTitle = (e.courseId?.title || "").toLowerCase();
        return studentName.includes(kw) || courseTitle.includes(kw);
      });
    }

    const total = await Enrollment.countDocuments(query);

    res.json({
      success: true,
      message: "Certificates retrieved successfully.",
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: enrollments,
    });
  } catch (error) {
    console.error("getAllCertificates error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching certificates.",
    });
  }
};

exports.approveCertificate = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment ID.",
      });
    }

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("userId", "fullname username email")
      .populate("courseId", "title");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    if (!enrollment.completed) {
      return res.status(400).json({
        success: false,
        message: "Student has not completed this course yet.",
      });
    }

    if (enrollment.certificateStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Certificate has already been approved.",
      });
    }

    if (enrollment.certificateStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve certificate with status: ${enrollment.certificateStatus}.`,
      });
    }

    enrollment.certificateStatus = "approved";
    enrollment.certificateApprovedBy = req.user._id;
    enrollment.certificateApprovedAt = new Date();
    enrollment.certificateRejectionReason = undefined;
    await enrollment.save();

    await sendNotification(req.app, {
      userId: enrollment.userId._id,
      title: "Certificate approved! 🎉",
      message: `Your certificate for "${enrollment.courseId?.title}" has been approved. You can now download it!`,
      type: "success",
      link: `/student/certificate/${enrollment.courseId._id}`
    });

    res.json({
      success: true,
      message: "Certificate approved successfully.",
      data: enrollment,
    });
  } catch (error) {
    console.error("approveCertificate error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while approving certificate.",
    });
  }
};

exports.rejectCertificate = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enrollment ID.",
      });
    }

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required.",
      });
    }

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("userId", "fullname username email")
      .populate("courseId", "title");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    if (!enrollment.completed) {
      return res.status(400).json({
        success: false,
        message: "Student has not completed this course yet.",
      });
    }

    if (enrollment.certificateStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject certificate with status: ${enrollment.certificateStatus}.`,
      });
    }

    enrollment.certificateStatus = "rejected";
    enrollment.certificateRejectionReason = String(reason).trim();
    enrollment.certificateApprovedBy = req.user._id;
    enrollment.certificateApprovedAt = new Date();
    await enrollment.save();

    await sendNotification(req.app, {
      userId: enrollment.userId._id,
      title: "Certificate rejected",
      message: `Sorry, your certificate for "${enrollment.courseId?.title}" has been rejected. Reason: ${enrollment.certificateRejectionReason}`,
      type: "error",
      link: `/student/my-courses`
    });

    res.json({
      success: true,
      message: "Certificate rejected.",
      data: enrollment,
    });
  } catch (error) {
    console.error("rejectCertificate error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while rejecting certificate.",
    });
  }
};

exports.getMyCertificates = async (req, res) => {
  try {
    const userId = req.user._id;

    const enrollments = await Enrollment.find({
      userId,
      completed: true,
      certificateStatus: "approved"
    })
      .populate({
        path: "courseId",
        select: "title thumbnail instructorId totalDuration rating",
        populate: { path: "instructorId", select: "fullname email" }
      })
      .populate("certificateApprovedBy", "fullname")
      .sort({ certificateApprovedAt: -1 })
      .lean();

    res.json({
      success: true,
      message: "Your certificates retrieved successfully.",
      total: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    console.error("getMyCertificates error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching your certificates.",
    });
  }
};

exports.getCertificateStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID.",
      });
    }

    const enrollment = await Enrollment.findOne({
      userId,
      courseId,
      paymentStatus: "paid"
    })
      .select("progress completed certificateStatus certificateApprovedAt certificateRejectionReason")
      .lean();

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found.",
      });
    }

    res.json({
      success: true,
      data: {
        progress: enrollment.progress,
        completed: enrollment.completed,
        certificateStatus: enrollment.certificateStatus,
        certificateApprovedAt: enrollment.certificateApprovedAt,
        certificateRejectionReason: enrollment.certificateRejectionReason,
      },
    });
  } catch (error) {
    console.error("getCertificateStatus error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching certificate status.",
    });
  }
};
