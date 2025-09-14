import express from 'express';
import Post from '../models/Post.js';
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a post
router.post("/", protect, async (req, res) => {
    try {
        const { title, content, tags, cover} = req.body;

        const post = new Post({
            title,
            content,
            tags,
            cover,
            author: req.user._id,
        });

        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

//get All posts
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "username avatar")
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
})