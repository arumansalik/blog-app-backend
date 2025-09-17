import Post from "../models/Post.js";

export const getTrendingPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "username avatar")
            .sort({likes: -1, views: -1})
            .limit(10);

        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const getNewestPost = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "username avatar")
            .sort({ createdAt: -1 })
            .limit(10);

        res.json(posts) ;
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}