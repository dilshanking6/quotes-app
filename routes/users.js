const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, upload.single('profilePhoto'), userController.updateProfile);

// @route   GET api/users/nearby
// @desc    Get nearby users
// @access  Public
router.get('/nearby', userController.getNearbyUsers);

// @route   GET api/users/search
// @desc    Search users
// @access  Public
router.get('/search', userController.searchUsers);

// @route   POST api/users/favorite/:postId
// @desc    Toggle favorite post
// @access  Private
router.post('/favorite/:postId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const postId = req.params.postId;
        if (user.favorites.includes(postId)) {
            user.favorites = user.favorites.filter(id => id.toString() !== postId);
        } else {
            user.favorites.push(postId);
        }
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
