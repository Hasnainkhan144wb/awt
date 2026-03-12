const express = require('express');
const router = express.Router();
const { getPosts, getPost, createPostView, createPost, editPostView, updatePost, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getPosts);
router.get('/posts/new', protect, createPostView);
router.post('/posts', protect, createPost);
router.get('/posts/:id', getPost);
router.get('/posts/:id/edit', protect, editPostView);
router.post('/posts/:id/update', protect, updatePost);
router.post('/posts/:id/delete', protect, deletePost);

module.exports = router;
