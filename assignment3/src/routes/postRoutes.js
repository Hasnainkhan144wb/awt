const express = require('express');
const router = express.Router();
const {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// Mount comment router on /posts/:postId/comments
const commentRouter = require('./commentRoutes');
router.use('/:postId/comments', commentRouter);

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);

module.exports = router;
