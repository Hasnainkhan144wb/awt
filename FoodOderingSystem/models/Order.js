const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userName: String,
    userEmail: String,
    items: [{
        name: String,
        price: Number,
        quantity: Number
    }],
    total: Number,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('Order', OrderSchema);