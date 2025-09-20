const Caregiver = require('../models/Caregiver');
const Notification = require('../models/Notification');

exports.subscribe = async (req, res) => {
    const { subscription, caregiverId } = req.body;

    try {
        const caregiver = await Caregiver.findById(caregiverId);

        if (!caregiver) {
            return res.status(404).json({ success: false, message: 'Caregiver not found' });
        }

        caregiver.subscription = subscription;
        await caregiver.save();

        res.status(200).json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        if (notification.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        notification.status = 'read';
        await notification.save();

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
