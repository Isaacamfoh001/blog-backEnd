const router = require("express").Router();
const multer = require("multer");
const {
  makeAPost,
  updatePost,
  deletePost,
  getPost,
  getPosts,
  searchByTitle,
  getAllUserPosts,
} = require("../Controllers/posts");

const { verifyPostOwner, verifyToken } = require("../utils/verifyToken");

const storage = multer.memoryStorage(); // Store uploaded file in memory
const upload = multer({ storage });

router.post("/", verifyToken, upload.single("descPhoto"), makeAPost);

router.put("/:id", verifyToken, upload.single("descPhoto"), updatePost);

router.delete("/:id", verifyPostOwner, deletePost);

router.get("/search", searchByTitle);
//http://localhost:3000/api/posts/search?title=programming

router.get("/:id", getPost);

router.get("/", getPosts);

router.get("/user/:userId", getAllUserPosts);

module.exports = router;
