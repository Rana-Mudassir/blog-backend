const express = require("express");
const Post = require("../models/Post");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Images only!");
    }
  },
});

router.post("/", upload.single("image"), protect, async (req, res) => {
  try {
    const { title, content, categories } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";
    const newPost = new Post({
      title,
      content,
      categories,
      image,
      author: req.user._id,
    });

    const createdPost = await newPost.save();
    res.status(201).json(createdPost);
  } catch (error) {
    res.status(500).json({ message: "Error creating post: " + error.message });
  }
});

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const skip = (page - 1) * limit;

  try {
    const posts = await Post.find()
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    res.json({
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name");
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching post" });
  }
});

router.put("/:id", protect, async (req, res) => {
  const { title, content, categories } = req.body;
  try {
    const post = await Post.findById(req.params.id);

    if (post && post.author.toString() === req.user._id.toString()) {
      post.title = title;
      post.content = content;
      post.categories = categories;
      const updatedPost = await post.save();
      res.json(updatedPost);
    } else {
      res.status(401).json({ message: "Not authorized" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating post" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post && post.author.toString() === req.user._id.toString()) {
      await Post.findByIdAndDelete(req.params.id);
      res.json({ message: "Post removed" });
    } else {
      res.status(401).json({ message: "Not authorized" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting post, "});
  }
});

module.exports = router;
