const Story = require('../models/Story');

exports.createStory = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Media required for story' });

        const newStory = new Story({
            user: req.user.id,
            content: `/uploads/stories/${req.file.filename}`
        });

        await newStory.save();
        res.status(201).json(newStory);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getActiveStories = async (req, res) => {
    try {
        const stories = await Story.find()
            .populate('user', 'username profilePhoto')
            .sort({ createdAt: -1 });
        res.json(stories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
