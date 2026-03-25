const Notification = require("../../models/Notification");
const User = require("../../models/User");

/**
 * Send a notification to a user
 * @param {Object} app - Express app instance (to get io)
 * @param {Object} data - Notification data { userId, title, message, type, link }
 */
const sendNotification = async (app, data) => {
  try {
    const { userId, title, message, type = "info", link = "" } = data;

    // 1. Save to Database
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
    });

    // 2. Emit Real-time via Socket.io
    const io = app.get("io");
    if (io) {
      io.to(userId.toString()).emit("new-notification", notification);
    }

    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

/**
 * Send a notification to all admin users
 * @param {Object} app - Express app instance
 * @param {Object} data - Notification data { title, message, type, link }
 * @param {String} excludeUserId - Optional userId to exclude from notification (e.g., the person who triggered it)
 */
const notifyAdmins = async (app, data, excludeUserId = null) => {
  try {
    const admins = await User.find({ role: "admin" }).select("_id fullname email role");
    console.log(`🔍 [notifyAdmins] Total users in DB with role 'admin': ${admins?.length || 0}`);
    admins.forEach(admin => {
        console.log(`   - Found Admin: ${admin.fullname || admin.email} (ID: ${admin._id})`);
    });
    if (!admins || admins.length === 0) return;

    const filteredAdmins = excludeUserId 
      ? admins.filter(a => a._id.toString() !== excludeUserId.toString())
      : admins;

    const promises = filteredAdmins.map((admin) => {
      console.log(`✉️ Sending admin notification to: ${admin.fullname || admin.email} (${admin._id}) - Role: ${admin.role}`);
      return sendNotification(app, { ...data, userId: admin._id });
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("Error notifying admins:", error);
  }
};

module.exports = { sendNotification, notifyAdmins };
