const router = require('express').Router();
const {addToCart, getCart} = require('../controllers/cartController');

router.post('/', addToCart);
router.get('/', getCart);

module.exports = router;