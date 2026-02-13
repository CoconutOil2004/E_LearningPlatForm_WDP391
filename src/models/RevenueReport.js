const mongoose = require("mongoose");

const revenueReportSchema = new mongoose.Schema({
  reportId: String,
  totalRevenue: Number,
  period: String,

  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("RevenueReport", revenueReportSchema);
