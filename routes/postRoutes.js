import express from 'express';
import Post from '../models/Post.js';
import protect from "../middleware/authMiddleware.js";
import {
    toggleLikePost,
    toggleBookmarkPost,
    incrementPostView, getFeed
} from "../controllers/postController.js";

const router = express.Router();

router.get("/feed", protect, getFeed);

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
});

// Get single post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("author", "username avatar");
        if(!post) return res.status(404).json({ message: "Post Not Found" });
        res.json(post);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

//Update a post
router.put("/:id", protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post) return res.status(404).json({ message: "Post Not Found" });

        if(post.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;
        post.tags = req.body.tags || post.tags;
        post.cover = req.body.cover || post.cover;

        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//Delete a post
router.delete("/:id", protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post) return res.status(404).json({ message: "Post Not Found" });

        if(post.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await post.deleteOne();
        res.json({ message: "Post Deleted" });
    } catch (err) {
        res.status(500).json({ message : err.message});
    }
});



// Like/Unlike a post
router.put("/:postId/like", protect, toggleLikePost);

// Bookmark/Unbookmark a post
router.put("/:postId/bookmark", protect, toggleBookmarkPost);

// Increment views (public route)
router.put("/:postId/view", incrementPostView);



export default router;