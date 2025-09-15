import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

export const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const { postId } = req.params;

        const newComment = new Comment.create({
            content,
            author: req.user._id,
            post: postId,
        });

        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ message : err.message });
    }
};

export const replyToComment = async (req, res) => {
    try {
        const { content } = req.body;
        const { commentId } = req.params;

        const parentComment = await Comment.findById(commentId);
        if(!parentComment) return res.status(404).json({ message: "Comment not found" });

        const reply = await Comment.create({
            content,
            author: req.user._id,
            post: parentComment.post,
            parentComment: parentComment._id,
        });

        res.status(201).json(reply);
    } catch (err) {
        res.status(500).json({ message : err.message });
    }
}