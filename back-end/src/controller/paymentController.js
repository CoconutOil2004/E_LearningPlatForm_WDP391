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

    const paidEnrollment = await Enrollment.findOne({
      userId,
      courseId,
      paymentStatus: "paid",
    });

    if (paidEnrollment)
      return res.status(400).json({
        success: false,
        message: "You already bought this course",
      });

    let enrollment = await Enrollment.findOne({
      userId,
      courseId,
      paymentStatus: "pending",
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        userId,
        courseId,
        paymentStatus: "pending",
      });
    }

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
      if (enrollment && enrollment.paymentStatus !== "paid") {
        enrollment.paymentStatus = "paid";
        await enrollment.save();
        await Course.findByIdAndUpdate(enrollment.courseId, {
          $inc: { enrollmentCount: 1 },
        });
      }
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
   MY PAYMENTS - Lịch sử giao dịch của user
   GET /api/payments/my
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
        populate: { path: "courseId", select: "title price thumbnail" },
      })
      .sort({ paymentDate: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   ADMIN REVENUE SUMMARY (1)
   GET /api/payments/admin/revenue/summary?from=&to=
================================*/
exports.getRevenueSummary = async (req, res) => {
  try {
    const { from, to } = req.query;

    const dateFilter = {};
    if (from || to) {
      dateFilter.$and = [];
      const range = {};
      if (from) range.$gte = new Date(from);
      if (to) range.$lte = new Date(to);
      dateFilter.$and.push({ paymentDate: range });
    }

    const matchStage = {
      status: "success",
    };

    if (dateFilter.$and) {
      Object.assign(matchStage, dateFilter.$and[0]);
    }

    const [result] = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: result?.totalRevenue || 0,
        totalOrders: result?.totalOrders || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   ADMIN REVENUE BY DATE (2)
   GET /api/payments/admin/revenue/daily?from=&to=&groupBy=day|month
================================*/
exports.getRevenueByDate = async (req, res) => {
  try {
    const { from, to, groupBy = "day" } = req.query;

    const match = {
      status: "success",
    };

    if (from || to) {
      match.paymentDate = {};
      if (from) match.paymentDate.$gte = new Date(from);
      if (to) match.paymentDate.$lte = new Date(to);
    }

    const format = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";

    const result = await Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format, date: "$paymentDate" },
          },
          totalRevenue: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: result.map((r) => ({
        date: r._id,
        totalRevenue: r.totalRevenue,
        totalOrders: r.totalOrders,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   ADMIN REVENUE BY COURSE (3)
   GET /api/payments/admin/revenue/by-course?from=&to=
================================*/
exports.getRevenueByCourse = async (req, res) => {
  try {
    const { from, to } = req.query;

    const match = {
      status: "success",
    };

    if (from || to) {
      match.paymentDate = {};
      if (from) match.paymentDate.$gte = new Date(from);
      if (to) match.paymentDate.$lte = new Date(to);
    }

    const result = await Payment.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "enrollments",
          localField: "enrollmentId",
          foreignField: "_id",
          as: "enrollment",
        },
      },
      { $unwind: { path: "$enrollment", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$enrollment.courseId",
          totalRevenue: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.json({
      success: true,
      data: result.map((r) => ({
        courseId: r._id,
        title: r.course?.title || "Không xác định",
        totalRevenue: r.totalRevenue,
        totalOrders: r.totalOrders,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   ADMIN REVENUE SUMMARY (1)
   GET /api/payments/admin/revenue/summary?from=&to=
================================*/
exports.getRevenueSummary = async (req, res) => {
  try {
    const { from, to } = req.query;

    const dateFilter = {};
    if (from || to) {
      dateFilter.$and = [];
      const range = {};
      if (from) range.$gte = new Date(from);
      if (to) range.$lte = new Date(to);
      dateFilter.$and.push({ paymentDate: range });
    }

    const matchStage = {
      status: "success",
    };

    if (dateFilter.$and) {
      Object.assign(matchStage, dateFilter.$and[0]);
    }

    const [result] = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: result?.totalRevenue || 0,
        totalOrders: result?.totalOrders || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   ADMIN REVENUE BY DATE (2)
   GET /api/payments/admin/revenue/daily?from=&to=&groupBy=day|month
================================*/
exports.getRevenueByDate = async (req, res) => {
  try {
    const { from, to, groupBy = "day" } = req.query;

    const match = {
      status: "success",
    };

    if (from || to) {
      match.paymentDate = {};
      if (from) match.paymentDate.$gte = new Date(from);
      if (to) match.paymentDate.$lte = new Date(to);
    }

    const format = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";

    const result = await Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format, date: "$paymentDate" },
          },
          totalRevenue: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: result.map((r) => ({
        date: r._id,
        totalRevenue: r.totalRevenue,
        totalOrders: r.totalOrders,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===============================
   ADMIN REVENUE BY COURSE (3)
   GET /api/payments/admin/revenue/by-course?from=&to=
================================*/
exports.getRevenueByCourse = async (req, res) => {
  try {
    const { from, to } = req.query;

    const match = {
      status: "success",
    };

    if (from || to) {
      match.paymentDate = {};
      if (from) match.paymentDate.$gte = new Date(from);
      if (to) match.paymentDate.$lte = new Date(to);
    }

    const result = await Payment.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "enrollments",
          localField: "enrollmentId",
          foreignField: "_id",
          as: "enrollment",
        },
      },
      { $unwind: { path: "$enrollment", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$enrollment.courseId",
          totalRevenue: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.json({
      success: true,
      data: result.map((r) => ({
        courseId: r._id,
        title: r.course?.title || "Không xác định",
        totalRevenue: r.totalRevenue,
        totalOrders: r.totalOrders,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
