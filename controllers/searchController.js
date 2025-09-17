import Post from '../models/Post.js';
import User from '../models/User.js';

export const searchPosts = async (req, res) => {
    try {
        const { q } = req.query;
        if(!q) return res.status(400).json({ message: 'Search query required' });

        const posts = await Post.find({
            $or: [
                {title: { $regex: q , $options: "i" }},
                { content: { $regex: q , $options: "i" } },
                {tags: { $regex: q , $options: "i" }}
            ]
        })
            .populate("author", "username avatar")
            .sort({ createdAt: -1});

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;

    }
}