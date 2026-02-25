const Post = require('../models/Post');

/**
 * GET /api/v1/posts
 * Public — list published posts with pagination, filtering, search
 */
exports.getPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { status: 'published' };

        if (req.query.category) query.category = req.query.category;
        if (req.query.author) query.author = req.query.author;
        if (req.query.tag) query.tags = req.query.tag;
        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        const [posts, total] = await Promise.all([
            Post.find(query)
                .populate('author', 'name avatar')
                .populate('category', 'name slug')
                .populate('commentCount')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-content'), // send excerpt only in list view
            Post.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            data: {
                posts,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalPosts: total,
                    perPage: limit,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/posts/:id
 * Public — get single post and increment view count
 */
exports.getPost = async (req, res, next) => {
    try {
        const post = await Post.findOneAndUpdate(
            { _id: req.params.id, status: 'published' },
            { $inc: { views: 1 } },
            { new: true }
        )
            .populate('author', 'name avatar bio')
            .populate('category', 'name slug')
            .populate('commentCount');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found',
            });
        }

        res.status(200).json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/posts
 * Protected (authenticated users)
 */
exports.createPost = async (req, res, next) => {
    try {
        const { title, content, category, tags, status, coverImage } = req.body;

        const post = await Post.create({
            title,
            content,
            category,
            tags,
            status,
            coverImage,
            author: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: post,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/v1/posts/:id
 * Protected — author or admin only
 */
exports.updatePost = async (req, res, next) => {
    try {
        let post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Only author or admin can update
        if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this post',
            });
        }

        const allowedUpdates = ['title', 'content', 'category', 'tags', 'status', 'coverImage'];
        const updates = {};
        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        post = await Post.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: 'Post updated successfully',
            data: post,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/posts/:id
 * Protected — author or admin only
 */
exports.deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this post',
            });
        }

        await post.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Post deleted successfully',
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/v1/posts/:id/like
 * Protected — toggle like
 */
exports.toggleLike = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const userId = req.user.id;
        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: alreadyLiked ? 'Post unliked' : 'Post liked',
            data: { likeCount: post.likes.length, liked: !alreadyLiked },
        });
    } catch (error) {
        next(error);
    }
};
