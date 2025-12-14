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
        const skip = parseInt(req.query.skip || 0, 10);
        const limit = Math.min(parseInt(req.query.limit || 20, 10), 50); // cap limit

        const posts = await Post.find()
            .populate("author", "username avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Also return total count so frontend can know when to stop (optional)
        const total = await Post.countDocuments();

        res.json({ posts, total });
    } catch (err) {
        res.status(500).json({ message: err.message });
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

/* -------------------------------------------
   🔥 TRENDING POSTS (Top 5 by likes + views)
-------------------------------------------- */
router.get("/trending", async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ likes: -1, views: -1 })
            .limit(5)
            .populate("author", "username avatar");

        res.json({ posts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* -------------------------------------------
   🔥 POPULAR TAGS (Top 10 unique tags)
-------------------------------------------- */
router.get("/tags", async (req, res) => {
    try {
        const posts = await Post.find({});
        let tagList = [];

        posts.forEach((post) => {
            if (post.tags) tagList.push(...post.tags);
        });

        const uniqueTags = [...new Set(tagList)].slice(0, 10);

        res.json({ tags: uniqueTags });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* -------------------------------------------
   🔥 TOP WRITERS (Rank by post count)
-------------------------------------------- */
router.get("/top-writers", async (req, res) => {
    try {
        const writers = await Post.aggregate([
            {
                $group: {
                    _id: "$author",
                    posts: { $sum: 1 }
                }
            },
            { $sort: { posts: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 1,
                    posts: 1,
                    username: "$user.username",
                    avatar: "$user.avatar"
                }
            }
        ]);

        res.json({ writers });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// Like/Unlike a post
router.put("/:postId/like", protect, toggleLikePost);

// Bookmark/Unbookmark a post
router.put("/:postId/bookmark", protect, toggleBookmarkPost);

// Increment views (public route)
router.put("/:postId/view", incrementPostView);




export default router;