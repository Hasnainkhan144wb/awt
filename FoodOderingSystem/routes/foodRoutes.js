const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getFoods, addFood, updateFood, deleteFood } = require('../controllers/foodcontroller');

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/', getFoods);
router.post('/', upload.single('image'), addFood); // Image support added
router.put('/:id', upload.single('image'), updateFood); // Image update support
router.delete('/:id', deleteFood);

module.exports = router;