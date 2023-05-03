import { Post } from "../models/Posts.js";
import { User } from "../models/User.js";

export const createPost = async (req, res) => {
  try {
    const { description, picturePath } = req.body;

    if (!description && !picturePath) {
      return res
        .status(400)
        .send({ message: "Post needs to have a caption or a photo" });
    }

    const newPost = await Post.create({
      user: req.user._id,
      description,
      picturePath,
      likes: {},
      comments: [],
    });

    if (!newPost) {
      return res.status(409).send({ message: "Failed to upload post" });
    }

    res.status(201).send({ message: "Post uploaded successfully" });
  } catch (error) {
    res.status(409).send({ message: `${error.message}` });
  }
};

export const getFeedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const posts = await Post.find({
      user: { $in: [req.user._id, ...user.friends] },
    })
      .populate("user", "-password -friends")
      .sort({ updatedAt: -1 });

    res.status(200).send(posts);
  } catch (error) {
    res.status(404).send({ message: `${error.message}` });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const loggedUser = await User.findById(req.user._id);

    if(!loggedUser){
      return res.status(404).send({ message: "No user found" });
    }

    const posts = await Post.find({ user: userId })
      .populate("user", "-password -friends")
      .sort({ updatedAt: -1 });

    res.status(200).send(posts);
  } catch (error) {
    res.status(404).send({ message: `${error.message}` });
  }
};

export const updateLike = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    const isLiked = post.likes.get(req.user._id);

    if (isLiked) {
      post.likes.delete(req.user._id);
    } else {
      post.likes.set(req.user._id, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: { likes: post.likes } },
      { new: true }
    ).populate("user", "-password -friends");

    res.status(200).send(updatedPost);
  } catch (error) {
    res.status(404).send({ message: `${error.message}` });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(404).send({ message: "Comment cannot be blank" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    const user = await User.findById(req.user._id);

    post.comments.push({
      userId: req.user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      picturePath: user.picturePath,
      comment,
    });

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: { comments: post.comments } },
      { new: true }
    ).populate("user", "-password -friends");

    res.status(200).send(updatedPost);
  } catch (error) {
    res.status(404).send({ message: `${error.message}` });
  }
};
