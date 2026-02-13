const express = require("express");
const dotenv = require("dotenv");
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use("/api/auth", require("./src/routes/authRoutes"));

app.listen(process.env.PORT, () =>
  console.log("Server running")
);
