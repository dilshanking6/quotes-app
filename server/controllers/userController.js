const User = require('../models/User');

exports.updateProfile = async (req, res) => {
    try {
        const { bio, location } = req.body;
        const updateData = {};
        if (bio) updateData.bio = bio;
        if (location) {
            const loc = JSON.parse(location);
            updateData.location = {
                type: 'Point',
                coordinates: [loc.lng, loc.lat]
            };
        }
        if (req.file) {
            updateData.profilePhoto = `/uploads/profiles/${req.file.filename}`;
        }

        const user = await User.findByIdAndUpdate(req.user.id, { $set: updateData }, { new: true }).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getNearbyUsers = async (req, res) => {
    try {
        const { lng, lat, maxDistance = 50000 } = req.query; // Default 50km
        if (!lng || !lat) return res.status(400).json({ message: 'Location required' });

        const users = await User.find({
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        }).select('username profilePhoto bio location');

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const query = req.query.q;
        const users = await User.find({
            username: { $regex: query, $options: 'i' }
        }).select('username profilePhoto bio');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
