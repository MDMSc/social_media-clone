import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createPost,
  getFeedPosts,
  getUserPosts,
  updateComment,
  updateLike,
} from "../controllers/postController.js";

const router = express.Router();

router.post("/new-post", authMiddleware, createPost);
router.get("/", authMiddleware, getFeedPosts);
router.get("/:userId", authMiddleware, getUserPosts);
router.patch("/like/:postId", authMiddleware, updateLike);
router.patch("/comment/:postId", authMiddleware, updateComment);

export const postRoutes = router;
