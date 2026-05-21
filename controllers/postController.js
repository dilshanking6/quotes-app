const Post = require('../models/Post');

exports.createPost = async (req, res) => {
    try {
        const { type, content, categories } = req.body;
        let postContent = content;

        if (type !== 'text' && req.file) {
            postContent = `/uploads/posts/${req.file.filename}`;
        }

        const newPost = new Post({
            user: req.user.id,
            type,
            content: postContent,
            categories: categories ? JSON.parse(categories) : ['General']
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category && category !== 'All') {
            query.categories = category;
        }

        const posts = await Post.find(query)
            .populate('user', 'username profilePhoto')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.likes.includes(req.user.id)) {
            post.likes = post.likes.filter(id => id.toString() !== req.user.id);
        } else {
            post.likes.push(req.user.id);
        }

        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.commentPost = async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const newComment = {
            user: req.user.id,
            text
        };

        post.comments.push(newComment);
        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
