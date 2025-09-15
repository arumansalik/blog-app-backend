import express from 'express';
import protect from "../middleware/authMiddleware.js"
import {
    addComment,
    getCommentsByPost,
    deleteComment,
    toggleLikeComment, replyToComment
} from "../controllers/commentController.js";

const router = express.Router();

router.post("/:postId", protect, addComment);
router.post("/reply/:commentId", protect, replyToComment);
router.get("/post/:postId", protect, getCommentsByPost);
router.delete("/:commentId", protect, deleteComment);
router.put("/:commentId/like", protect, toggleLikeComment);

export default router;