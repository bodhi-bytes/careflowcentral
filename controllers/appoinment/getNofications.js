const notificationModal = require("../../models/notificationSchema");

const getNotification = async (req, res) => {
    try {
        const userId = req.user?._id;
        const notification = await notificationModal
            .find({ userId })
            .sort({ createdAt: -1 });
        return res.status(200).json({ message: "notification successfully fetched", success: true, notification })
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

module.exports = getNotification;
