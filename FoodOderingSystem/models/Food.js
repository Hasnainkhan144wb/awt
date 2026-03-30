const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String } // Image file ka path save hoga
});

module.exports = mongoose.model('Food', FoodSchema);