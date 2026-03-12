// ⚠️ PHẢI LOAD DOTENV ĐẦU TIÊN — trước mọi require khác
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./src/config/db");

// Load passport strategy SAU khi dotenv đã config
require("./src/config/passport");

connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(passport.initialize());
app.use(express.json());

/* ================= SWAGGER API DOCS ================= */
const swaggerUi = require("swagger-ui-express");
// const swaggerDocument = require("./src/doc/swagger");
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/* ================= ROUTES ================= */
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/courses", require("./src/routes/courseRoutes"));
app.use("/api/categories", require("./src/routes/categoryRoutes"));
app.use("/api/upload", require("./src/routes/uploadRoutes"));
app.use("/api/payments", require("./src/routes/paymentRoutes"));
app.use("/api/enrollments", require("./src/routes/enrollmentRoutes"));
app.use("/api/blogs", require("./src/routes/blogRoutes"));
/* ========================================== */

const PORT = process.env.PORT || 9999;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`),
);
