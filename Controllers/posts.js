const express = require("express");
const router = express.Router();
const sharp = require("sharp");

const { Post } = require("../Models/Post");
const { User } = require("../Models/User");

const makeAPost = async (req, res, next) => {
  try {
    const newPostData = req.body;
    const userId = req.user.id;

    if (req.file) {
      const processedImageBuffer = await sharp(req.file.buffer)
        .resize(200, 200)
        .toBuffer();

      console.log("processedImageBuffer: ", processedImageBuffer);

      // Convert the processed image buffer to a base64 string
      const base64Image = processedImageBuffer.toString("base64");
      console.log("base64Image: ", base64Image);

      // Include the base64 image data in the descPhoto field of the new post data
      newPostData.descPhoto = base64Image;
    }

    // Include the user's ID as the author
    newPostData.authorId = userId;

    // Fetch the author's profilePicture
    const author = await User.findById(userId).select("profilePicture").exec();

    if (!author) {
      return res.status(400).json({ error: "User not found" });
    }

    // Include the authorProfilePic in the new post data
    newPostData.authorProfilePic = author.profilePicture;

    // Create a new post with the updated data
    const newPost = new Post(newPostData);

    // Save the new post to the database
    const savedPost = await newPost.save();

    res.status(200).json(savedPost);
  } catch (error) {
    console.log("Error: ", error);
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const updatedFields = req.body;
    console.log("PostID: ", postId);
    console.log("Request body: ", req.body);

    console.log("Request file: ", req.file);

    if (req.file) {
      // Process the new image
      const processedImageBuffer = await sharp(req.file.buffer)
        .resize(200, 200)
        .toBuffer();

      // Convert the processed image buffer to a base64 string
      const base64Image = processedImageBuffer.toString("base64");

      // Include the base64 image data in the descPhoto field of the updatedFields
      updatedFields.descPhoto = base64Image;
    }

    // Use findOneAndUpdate to find and update the post
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    console.log("Updated Post: ", updatedPost);
    res.status(200).json(updatedPost);
    console.log("Post updated successfully");
  } catch (err) {
    console.log("Failed to update post");
    console.log("Error: ", err);
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post == null) next(err);
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json("Post has been deleted.");
  } catch (err) {
    next(err);
  }
};

const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post == null) {
      res.status(404).send("The post you are looking for isn't available");
      return;
    }

    res.status(200).send(post);
  } catch (err) {
    next(err);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const offset = req.query.offset || 0; // Get the offset from the request
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // Sort by 'createdAt' in descending order (newest to oldest)
      .skip(offset)
      .limit(10); // Adjust '10' to the desired batch size
    // Send the posts as a response
    res.status(200).json(posts);
  } catch (err) {
    console.log("Error: ", err);
    next(err);
  }
};

const searchByTitle = async (req, res, next) => {
  try {
    const searchText = req.query.q || ""; // Get the search query from the request

    // Create a regex pattern for case-insensitive and partial matching
    const regex = new RegExp(searchText, "i");

    // Find articles whose title matches the regex pattern
    const articles = await Post.find({ title: regex });

    res.status(200).json(articles);
  } catch (error) {
    next(error);
  }
};

// Controller to get all posts of a specific user
const getAllUserPosts = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    // Use Mongoose to query for posts created by the specified user
    const userPosts = await Post.find({ authorId: userId });

    if (!userPosts) {
      return res.status(404).send("User has no posts.");
    }

    res.status(200).json(userPosts);
  } catch (error) {
    next(error);
  }
};

module.exports.makeAPost = makeAPost;
module.exports.getPost = getPost;
module.exports.getPosts = getPosts;
module.exports.updatePost = updatePost;
module.exports.deletePost = deletePost;
module.exports.searchByTitle = searchByTitle;
module.exports.getAllUserPosts = getAllUserPosts;
