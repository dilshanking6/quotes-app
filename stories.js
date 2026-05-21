const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   POST api/stories
// @desc    Create a story
// @access  Private
router.post('/', auth, upload.single('storyMedia'), storyController.createStory);

// @route   GET api/stories
// @desc    Get all active stories
// @access  Public
router.get('/', storyController.getActiveStories);

module.exports = router;
