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

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

// Store io in app for easy access in controllers
app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their notification room`);
  });

  socket.on("disconnect", () => {
    console.log("🔥 User disconnected");
  });
});

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
const swaggerDocument = require("./src/config/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/* ================= ROUTES ================= */
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/courses", require("./src/routes/courseRoutes"));
app.use("/api/categories", require("./src/routes/categoryRoutes"));
app.use("/api/upload", require("./src/routes/uploadRoutes"));
app.use("/api/payments", require("./src/routes/paymentRoutes"));
app.use("/api/enrollments", require("./src/routes/enrollmentRoutes"));
app.use("/api/blogs", require("./src/routes/blogRoutes"));
app.use("/api/notifications", require("./src/routes/notificationRoutes"));
app.use("/api/reviews", require("./src/routes/reviewRoutes"));
app.use("/api/comments", require("./src/routes/commentRoutes"));
app.use("/api/analytics", require("./src/routes/analyticsRoutes"));
/* ========================================== */

const PORT = process.env.PORT || 9999;
server.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`),
);
