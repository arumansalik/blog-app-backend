import Post from "../models/Post.js";
import User from "../models/User.js";

export const toggleLikePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({ message: 'Post not found!' });

        if(post.likes.includes(userId)) {
            post.likes.pull(userId)
        } else {
            post.likes.push(userId);
        }

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleBookmarkPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({ message: 'Post not found!' });

        if(post.bookmarks.includes(userId)) {
            post.bookmarks.pull(userId);
        } else {
            post.bookmarks.push(userId);
        }

        await post.save();
        res.json(post);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

export const incrementPostView = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findByIdAndUpdate(
            postId,
            {  $inc: { views: 1 } },
            { new: true}
        );

        if(!post) return res.status(404).json({ message: 'Post not found!' });

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFeed = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);

        if(!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const posts = await Post.find({
            author: { $in: [...currentUser.following, currentUser._id]}
        })
            .populate("author", "username avatar")
            .sort({ createdAt: -1});

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}