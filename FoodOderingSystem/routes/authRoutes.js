const router = require('express').Router();
const { register, login } = require('../controllers/authcontroller');
const { body } = require('express-validator');

router.post('/register', [
    body('name').notEmpty().withMessage("Name required"),
    body('email').isEmail().withMessage("Valid email required"),
    body('password').isLength({ min: 6 }).withMessage("Min 6 chars")
], register);

router.post('/login', login);

module.exports = router;