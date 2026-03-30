const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Pehle check karein ke email maujood to nahi
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        const hash = await bcrypt.hash(password, 10);
        
        // Naya user role ke sath save karein
        user = new User({ name, email, password: hash, role });
        await user.save();
        
        res.json({ msg: "Registered successfully! Now Login." });
    } catch (err) { 
        res.status(500).json({ msg: "Server Error" }); 
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body; // Frontend se role bhi le rahe hain

        // 1. User ko email se dhoondein
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid Credentials: User not found" });

        // 2. Password check karein
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials: Wrong password" });

        // 3. ROLE LOGIC (Fix): Check karein ke selected role aur DB role match karte hain
        if (user.role !== role) {
            return res.status(403).json({ 
                msg: `Access Denied: You are registered as a ${user.role}, but trying to login as ${role}.` 
            });
        }

        // 4. Token generate karein
        const token = jwt.sign({ id: user._id, role: user.role }, 'secret', { expiresIn: '1d' });
        
        res.json({ 
            token, 
            role: user.role, 
            name: user.name,
            msg: "Login Successful" 
        });

    } catch (err) { 
        res.status(500).json({ msg: "Server Error" }); 
    }
};