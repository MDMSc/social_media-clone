import express from "express";
import {
  addRemoveFriend,
  getUser,
  getUserFriendList,
  searchUsers,
  userLogin,
  userLogout,
  userRegister,
} from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/logout", authMiddleware, userLogout);
router.get("/:userId", authMiddleware, getUser);
router.get("/friendList/:userId", authMiddleware, getUserFriendList);
router.patch("/:userId/:friendId", authMiddleware, addRemoveFriend);
router.get("/", authMiddleware, searchUsers);

export const userRoutes = router;
