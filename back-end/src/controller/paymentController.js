const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Payment = require("../models/Payment");
const { createPaymentUrl, verifyReturnUrl } = require("../utils/vnpay");

/* ===============================
   CREATE PAYMENT (VNPay)
================================*/
exports.createPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, paymentMethod } = req.body;

    if (paymentMethod !== "vnpay") {
      return res.status(400).json({
        success: false,
        message: "Chỉ hỗ trợ thanh toán VNPay. Gửi paymentMethod: 'vnpay'.",
      });
    }

    const course = await Course.findById(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    const existed = await Enrollment.findOne({
      userId,
      courseId,
      paymentStatus: "paid",
    });

    if (existed)
      return res.status(400).json({
        success: false,
        message: "You already bought this course",
      });

    const enrollment = await Enrollment.create({
      userId,
      courseId,
      paymentStatus: "pending",
    });

    const payment = await Payment.create({
      enrollmentId: enrollment._id,
      amount: course.price,
      paymentMethod: "vnpay",
      status: "pending",
    });

    const ipAddr =
      req.ip ||
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      "127.0.0.1";
    const orderInfo = `Thanh toan khoa hoc ${courseId}`;

    const paymentUrl = createPaymentUrl({
      amount: course.price,
      orderId: payment._id.toString(),
      ipAddr,
      orderInfo,
    });

    res.json({
      success: true,
      paymentUrl,
      paymentId: payment._id,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   VNPay RETURN URL - Nhận kết quả từ VNPay
   GET /api/payments/callback?vnp_xxx=...
================================*/
exports.paymentCallback = async (req, res) => {
  try {
    const query = req.query;

    if (!query.vnp_SecureHash) {
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:9999"}?payment=error&message=invalid_callback`,
      );
    }

    const verify = verifyReturnUrl(query);

    if (!verify.isVerified) {
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:9999"}?payment=error&message=invalid_signature`,
      );
    }

    const payment = await Payment.findById(verify.orderId).populate(
      "enrollmentId",
    );

    if (!payment) {
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:9999"}?payment=error&message=order_not_found`,
      );
    }

    if (payment.status === "success") {
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:9999"}?payment=success&courseId=${payment.enrollmentId.courseId}`,
      );
    }

    payment.status = verify.isSuccess ? "success" : "failed";
    payment.paymentDate = new Date();
    payment.transactionId = verify.transactionNo || "VNP_" + Date.now();
    await payment.save();

    if (verify.isSuccess) {
      const enrollment = await Enrollment.findById(payment.enrollmentId._id);
      enrollment.paymentStatus = "paid";
      await enrollment.save();
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:9999";
    const courseId = payment.enrollmentId?.courseId || "";

    if (verify.isSuccess) {
      return res.redirect(`${clientUrl}?payment=success&courseId=${courseId}`);
    }

    return res.redirect(
      `${clientUrl}?payment=failed&code=${verify.responseCode}`,
    );
  } catch (err) {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:9999";
    return res.redirect(
      `${clientUrl}?payment=error&message=${encodeURIComponent(err.message)}`,
    );
  }
};

/* ===============================
   MY PAYMENTS
================================*/
exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user._id;

    const enrollments = await Enrollment.find({ userId }).select("_id");
    const enrollmentIds = enrollments.map((e) => e._id);

    const payments = await Payment.find({
      enrollmentId: { $in: enrollmentIds },
    })
      .populate({
        path: "enrollmentId",
        populate: { path: "courseId" },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
