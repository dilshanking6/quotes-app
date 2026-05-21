const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');

// @route   GET api/chat/history/:otherUserId
// @desc    Get chat history with a user
// @access  Private
router.get('/history/:otherUserId', auth, chatController.getChatHistory);

// @route   GET api/chat/recent
// @desc    Get recent chat users
// @access  Private
router.get('/recent', auth, chatController.getRecentChats);

module.exports = router;
