const Cart = require('../models/Cart');

exports.addToCart = async (req, res) => {
    const cart = new Cart(req.body);
    await cart.save();
    res.json(cart);
};

exports.getCart = async (req, res) => {
    const cart = await Cart.find();
    res.json(cart);
};