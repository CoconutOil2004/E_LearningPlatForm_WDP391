// C:\prj\SDN302_Group7\back-end\src\controllers\notificationController.js

const Notification = require('../models/Notification'); 
// ĐÃ BỎ: const ErrorHandler = require('../utils/ErrorHandler');
// ĐÃ BỎ: const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// Get list of notifications for the current user
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user._id; // Get user ID
        
        // Get up to 50 notifications, sorted by latest
        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 }) // Latest first
            .limit(50);

        res.status(200).json({
            success: true,
            notifications,
        });

    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching notifications.' 
        });
    }
};

// Mark a specific notification as read
exports.markOneAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id; 

        const notification = await Notification.findOneAndUpdate(
            { _id: id, user: userId, isRead: false },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            // Return 404 if not found or already read
            return res.status(404).json({
                success: false,
                message: 'Notification does not exist or has already been marked as read.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read.',
            notification,
        });

    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating notification status.' 
        });
    }
};

// Mark ALL notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id; 

        // Update all UNREAD notifications for this user
        const result = await Notification.updateMany(
            { user: userId, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: `Marked ${result.modifiedCount} notifications as read.`,
            modifiedCount: result.modifiedCount,
        });

    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating all notifications.' 
        });
    }
};