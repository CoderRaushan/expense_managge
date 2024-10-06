const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    item_name: String,
    cost: Number,
    category: String,
    date: Date,
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    items: [itemSchema],
});

module.exports = mongoose.model('User', userSchema);
