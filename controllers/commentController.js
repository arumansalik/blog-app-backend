import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

export const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const { postId } = req.params;

        const newComment = await Comment.create({
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

export const getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ post: postId, parentComment: null})
            .populate("author", "username avatar")
            .populate({
                path: "likes",
                select: "username"
            })
            .lean();

        for(let comment of comments) {
            comment.replies = await Comment.find({ parentComment: comment._id})
                .populate("author", "username avatar")
                .populate({
                    path: "likes",
                    select: "username"
                });
        }
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if(!comment) return res.status(404).json({ message: "Comment not found" });

        if(comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Comment.findByIdAndDelete(commentId);
        res.json({ message: "Comment deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleLikeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        const userId = req.user._id;
        if(comment.likes.includes(userId)) {
            comment.likes.pull(userId);
        } else {
            comment.likes.push(userId);
        }

        await comment.save();
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};