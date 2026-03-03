const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const existed = await User.findOne({ email });

    if (existed)
      return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({
      fullName,
      email,
      password,
      role
    });

    res.json({
      token: generateToken(user),
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ================= LOGIN ================= */
exports.login = async (req, res) => {

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      token: generateToken(user),
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
