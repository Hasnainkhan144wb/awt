const User = require('../models/User');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

exports.getRegister = (req, res) => {
    res.render('auth/register', { errors: [], formData: {} });
};

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('auth/register', {
            errors: errors.array(),
            formData: req.body
        });
    }

    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.render('auth/register', {
                errors: [{ msg: 'User already exists' }],
                formData: req.body
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        user = await User.create({
            name,
            email,
            password: passwordHash
        });

        req.session.user = { id: user._id, name: user.name, email: user.email };
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('auth/register', {
            errors: [{ msg: 'Server Error' }],
            formData: req.body
        });
    }
};

exports.getLogin = (req, res) => {
    res.render('auth/login', { errors: [], formData: {} });
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('auth/login', {
            errors: errors.array(),
            formData: req.body
        });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.render('auth/login', {
                errors: [{ msg: 'Invalid Credentials' }],
                formData: req.body
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('auth/login', {
                errors: [{ msg: 'Invalid Credentials' }],
                formData: req.body
            });
        }

        req.session.user = { id: user._id, name: user.name, email: user.email };
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('auth/login', {
            errors: [{ msg: 'Server Error' }],
            formData: req.body
        });
    }
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};
