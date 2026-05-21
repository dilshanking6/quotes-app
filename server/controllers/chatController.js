const Message = require('../models/Message');

exports.getChatHistory = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: otherUserId },
                { sender: otherUserId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRecentChats = async (req, res) => {
    try {
        // This is a bit complex for a simple app, so we'll just return users who have messaged the current user
        const messages = await Message.find({
            $or: [{ sender: req.user.id }, { receiver: req.user.id }]
        }).populate('sender receiver', 'username profilePhoto');

        const usersMap = new Map();
        messages.forEach(msg => {
            const otherUser = msg.sender._id.toString() === req.user.id ? msg.receiver : msg.sender;
            usersMap.set(otherUser._id.toString(), otherUser);
        });

        res.json(Array.from(usersMap.values()));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
