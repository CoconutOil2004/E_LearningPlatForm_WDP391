const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

/* ================= ROUTES ================= */

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/courses", require("./src/routes/courseRoutes"));
app.use("/api/images", require("./src/routes/imageRoutes"));
app.use("/api/payments", require("./src/routes/paymentRoutes"));
app.use("/api/enrollments", require("./src/routes/enrollmentRoutes"));

/* =========================================== */

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);