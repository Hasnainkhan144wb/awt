const Comment = require('../models/Comment');
const Post = require('../models/Post');

/**
 * GET /api/v1/posts/:postId/comments
 * Public — get top-level comments for a post
 */
exports.getComments = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [comments, total] = await Promise.all([
            Comment.find({ post: req.params.postId, parentComment: null })
                .populate('author', 'name avatar')
                .populate({
                    path: 'replies',
                    populate: { path: 'author', select: 'name avatar' },
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Comment.countDocuments({ post: req.params.postId, parentComment: null }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                comments,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalComments: total,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/posts/:postId/comments
 * Protected
 */
exports.createComment = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const { content, parentComment } = req.body;

        // Validate parent comment belongs to the same post
        if (parentComment) {
            const parent = await Comment.findById(parentComment);
            if (!parent || parent.post.toString() !== req.params.postId) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid parent comment',
                });
            }
        }

        const comment = await Comment.create({
            content,
            author: req.user.id,
            post: req.params.postId,
            parentComment: parentComment || null,
        });

        await comment.populate('author', 'name avatar');

        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data: comment,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/v1/posts/:postId/comments/:id
 * Protected — author only
 */
exports.updateComment = async (req, res, next) => {
    try {
        let comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        if (comment.author.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to edit this comment',
            });
        }

        comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { content: req.body.content, isEdited: true },
            { new: true, runValidators: true }
        ).populate('author', 'name avatar');

        res.status(200).json({
            success: true,
            message: 'Comment updated',
            data: comment,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/posts/:postId/comments/:id
 * Protected — author or admin
 */
exports.deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment',
            });
        }

        // Also delete child replies
        await Comment.deleteMany({ parentComment: comment._id });
        await comment.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Comment deleted',
            data: {},
        });
    } catch (error) {
        next(error);
    }
};
