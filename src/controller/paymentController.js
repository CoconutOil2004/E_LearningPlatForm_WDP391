const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Payment = require("../models/Payment");

/* ===============================
   CREATE PAYMENT
================================*/
exports.createPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, paymentMethod } = req.body;

    const course = await Course.findById(courseId);
    if (!course)
      return res.status(404).json({ message: "Course not found" });

    const existed = await Enrollment.findOne({
      userId,
      courseId,
      paymentStatus: "paid"
    });

    if (existed)
      return res.status(400).json({
        message: "You already bought this course"
      });

    const enrollment = await Enrollment.create({
      userId,
      courseId,
      paymentStatus: "pending"
    });

    const payment = await Payment.create({
      enrollmentId: enrollment._id,
      amount: course.price,
      paymentMethod,
      status: "pending"
    });

    const paymentUrl =
      `http://localhost:9999/api/payments/callback` +
      `?paymentId=${payment._id}&status=success`;

    res.json({
      paymentUrl
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ===============================
   PAYMENT CALLBACK
================================*/
exports.paymentCallback = async (req, res) => {
  try {
    const { paymentId, status } = req.query;

    const payment = await Payment.findById(paymentId)
      .populate("enrollmentId");

    if (!payment)
      return res.status(404).json({ message: "Payment not found" });

    payment.status = status;
    payment.paymentDate = new Date();
    payment.transactionId = "TRANS_" + Date.now();

    await payment.save();

    if (status === "success") {
      const enrollment = await Enrollment.findById(
        payment.enrollmentId._id
      );

      enrollment.paymentStatus = "paid";
      await enrollment.save();
    }

    res.send("Payment success ✅");

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ===============================
   MY PAYMENTS
================================*/
exports.getMyPayments = async (req, res) => {
  const payments = await Payment.find()
    .populate({
      path: "enrollmentId",
      populate: { path: "courseId" }
    });

  res.json(payments);
};