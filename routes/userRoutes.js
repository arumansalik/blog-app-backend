import express from 'express';
import protect  from "../middleware/authMiddleware.js";
import {
    getUserProfile,
    updateUserProfile,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
} from "../controllers/userController.js";


const router = express.Router();

router.get("/:username", getUserProfile);
router.put("/update", protect, updateUserProfile);

router.put("/:id/follow", protect, followUser);
router.put("/:id/unfollow", protect, unfollowUser);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);

export default router;