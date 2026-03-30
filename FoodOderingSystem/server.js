const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const path = require('path'); // Path module images serve karne ke liye zaroori hai

dotenv.config();
const app = express();

// --- MIDDLEWARES ---
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cors());

// --- STATIC FOLDER FOR IMAGES ---
// Is line ki wajah se frontend 'http://localhost:5000/uploads/filename.jpg' se images dekh sakega
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROUTES ---

app.get('/', (req, res) => {
    res.render('index');
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/foods', require('./routes/foodRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use(express.static(path.join(__dirname, 'public')));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/FoodOrderingSystem')
.then(() => {
    console.log("✅ MongoDB Connected Successfully");
})
.catch(err => {
    console.log("❌ DB Connection Error: ", err);
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📂 Images are being served from: ${path.join(__dirname, 'uploads')}`);
});