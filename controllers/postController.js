import Post from "../models/Post.js";

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