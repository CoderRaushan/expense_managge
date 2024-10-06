const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Registration
router.get('/register', (req, res) => {
    res.render('user/register');
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.redirect('/user/login');
});

// Login
router.get('/login', (req, res) => {
    res.render('user/login');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        res.redirect('/user/dashboard');
    } else {
        req.flash('error', 'Invalid credentials');
        res.redirect('/user/login');
    }
});

// Dashboard
router.get('/dashboard', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/user/login');
    }

    const user = await User.findById(req.session.userId);
    res.render('user/dashboard', { user });
});

// Add Item
router.get('/add-item', (req, res) => {
    res.render('user/add-item');
});

router.post('/add-item', async (req, res) => {
    const { item_name, cost, category, date } = req.body;
    const user = await User.findById(req.session.userId);
    user.items.push({ item_name, cost, category, date });
    await user.save();
    res.redirect('/user/dashboard');
});

// Get user data for graph
router.get('/graph-data', async (req, res) => {
    const user = await User.findById(req.session.userId);
    res.json(user.items);   
});

module.exports = router;
