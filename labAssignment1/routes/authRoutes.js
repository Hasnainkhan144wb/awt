const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { getRegister, register, getLogin, login, logout } = require('../controllers/authController');
const { guest } = require('../middleware/authMiddleware');

router.get('/register', guest, getRegister);

router.post('/register', guest, [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], register);

router.get('/login', guest, getLogin);

router.post('/login', guest, [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], login);

router.get('/logout', logout);

module.exports = router;
