import Post from "../models/Post.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const getTrendingPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "username avatar")
            .sort({ views: -1, likes: -1 })
            .limit(10);

        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getNewestPost = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "username avatar")
            .sort({ createdAt: -1 })
            .limit(10);

        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getPopularTags = async (req, res) => {
    try {
        const tags = await Post.aggregate([
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);
        res.json(tags);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Leaderboard: score = totalViews + (postCount * 10)
 * You can tune the multiplier (10) to prefer frequency or views.
 * Returns top N authors with their stats.
 */
export const getLeaderboard = async (req, res) => {
    try {
        // Aggregate posts by author
        const agg = await Post.aggregate([
            {
                $group: {
                    _id: "$author",
                    postsCount: { $sum: 1 },
                    totalViews: { $sum: "$views" },
                },
            },
            {
                $project: {
                    postsCount: 1,
                    totalViews: 1,
                    // score: you can change multiplier
                    score: { $add: ["$totalViews", { $multiply: ["$postsCount", 10] }] },
                },
            },
            { $sort: { score: -1 } },
            { $limit: 10 },
        ]);

        // Populate author details (username, avatar)
        const leaderboard = await Promise.all(
            agg.map(async (row) => {
                const user = await User.findById(row._id).select("username avatar");
                return {
                    author: user,
                    postsCount: row.postsCount,
                    totalViews: row.totalViews,
                    score: row.score,
                };
            })
        );

        res.json({ leaderboard });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
