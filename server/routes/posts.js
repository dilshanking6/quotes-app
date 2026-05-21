const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', auth, upload.single('postMedia'), postController.createPost);

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get('/', postController.getPosts);

// @route   POST api/posts/:id/like
// @desc    Like/Unlike a post
// @access  Private
router.post('/:id/like', auth, postController.likePost);

// @route   POST api/posts/:id/comment
// @desc    Comment on a post
// @access  Private
router.post('/:id/comment', auth, postController.commentPost);

module.exports = router;
