const Post = require('../models/Post');
const path = require('path');
const fs = require('fs');

exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'name').sort({ createdAt: -1 });
        res.render('posts/index', { posts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'name');
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.render('posts/show', { post });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.createPostView = (req, res) => {
    res.render('posts/create', { errors: [], formData: {} });
};

exports.createPost = async (req, res) => {
    const { title, content } = req.body;
    let errors = [];

    if (!title || !content) {
        errors.push({ msg: 'Please add a title and content' });
    }

    if (errors.length > 0) {
        return res.render('posts/create', { errors, formData: req.body });
    }

    try {
        let imageName = 'no-photo.jpg';

        if (req.files && req.files.image) {
            const image = req.files.image;
            
            // Validation
            if (!image.mimetype.startsWith('image')) {
                return res.render('posts/create', { errors: [{ msg: 'Please upload an image file' }], formData: req.body });
            }

            // Create custom filename
            imageName = `photo_${Date.now()}${path.parse(image.name).ext}`;
            const uploadPath = path.join(__dirname, '../public/uploads', imageName);

            await image.mv(uploadPath);
        }

        await Post.create({
            title,
            content,
            image: imageName,
            author: req.session.user.id
        });

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('posts/create', { errors: [{ msg: 'Server Error' }], formData: req.body });
    }
};

exports.editPostView = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        
        // Check user ownership
        if (post.author.toString() !== req.session.user.id) {
            return res.status(403).send('Not authorized to edit this post');
        }

        res.render('posts/edit', { post, errors: [] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updatePost = async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        if (post.author.toString() !== req.session.user.id) {
            return res.status(403).send('Not authorized to edit this post');
        }

        const { title, content } = req.body;
        let imageName = post.image;

        if (req.files && req.files.image) {
            const image = req.files.image;
            if (image.mimetype.startsWith('image')) {
                imageName = `photo_${Date.now()}${path.parse(image.name).ext}`;
                const uploadPath = path.join(__dirname, '../public/uploads', imageName);
                await image.mv(uploadPath);
            }
        }

        post.title = title;
        post.content = content;
        post.image = imageName;
        await post.save();

        res.redirect(`/posts/${post._id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        if (post.author.toString() !== req.session.user.id) {
            return res.status(403).send('Not authorized to delete this post');
        }

        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
