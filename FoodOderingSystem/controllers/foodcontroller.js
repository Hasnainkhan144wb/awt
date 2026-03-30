const Food = require('../models/Food');

exports.getFoods = async (req, res) => {
    try {
        const foods = await Food.find();
        res.json(foods);
    } catch (err) { res.status(500).json({ msg: "Server Error" }); }
};

exports.addFood = async (req, res) => {
    try {
        const { name, price } = req.body;
        const image = req.file ? req.file.filename : ""; // Multer se filename lena
        const newFood = new Food({ name, price, image });
        await newFood.save();
        res.json(newFood);
    } catch (err) { res.status(400).json({ msg: "Add failed" }); }
};

exports.updateFood = async (req, res) => {
    try {
        const { name, price } = req.body;
        let updateData = { name, price };
        if (req.file) {
            updateData.image = req.file.filename; // Nayi image upload ho to update karein
        }
        const updated = await Food.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (err) { res.status(400).json({ msg: "Update failed" }); }
};

exports.deleteFood = async (req, res) => {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
};