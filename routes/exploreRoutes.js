import express from "express";
import { getTrendingPosts, getNewestPost, getPopularTags} from "../controllers/exploreController.js";

const router = express.Router();

router.get("/trending", getTrendingPosts);
router.get("/newest", getNewestPost);
router.get("/tags", getPopularTags);

export default router;