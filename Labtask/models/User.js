const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // <--- Change this

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    
    // Hash the password
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', UserSchema);