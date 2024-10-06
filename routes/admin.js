const express = require('express');
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const User = require('../models/User');
const router = express.Router();


// Middleware
router.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
router.use(methodOverride('_method')); // Enable method override

// Delete Item
router.delete('/admin/delete-items/:userId/:itemId', async (req, res) => 
{
    const { userId, itemId } = req.params;
    console.log(userId, itemId); // For debugging

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }

        const item = user.items.id(itemId);
        if (!item) {
            return res.status(404).send("Item not found");
        }

        item.remove(); // Remove the item
        await user.save(); // Save the updated user

        res.redirect('/admin/dashboard'); // Redirect to the admin dashboard
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



// Registration
router.get('/register', (req, res) => {
    res.render('admin/register');
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashedPassword });
    await newAdmin.save();
    res.redirect('/admin/login');
});

// Login
router.get('/login', (req, res) => {
    res.render('admin/login');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (admin && await bcrypt.compare(password, admin.password)) {
        req.session.adminId = admin._id;
        res.redirect('/admin/dashboard');
    } else {
        req.flash('error', 'Invalid credentials');
        res.redirect('/admin/login');
    }
});
// Dashboard
router.get('/dashboard', async (req, res) => {
    if (!req.session.adminId) {
        return res.redirect('/admin/login');
    }

    const users = await User.find({});
    res.render('admin/dashboard', { users });
});

// Edit Item
router.post('/edit-item/:userId/:itemId', async (req, res) => {
   console.log("edit is reaced here!");
    const { userId, itemId } = req.params;
    const { item_name, cost, category, date } = req.body;

    const user = await User.findById(userId);
    const item = user.items.id(itemId);
    if (item) {
        item.item_name = item_name;
        item.cost = cost;
        item.category = category;
        item.date = date;
        await user.save();
    }
    res.redirect('/admin/dashboard');
});

router.get('/graph-data', async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        const graphData = [];

        users.forEach(user => {
            user.items.forEach(item => {
                graphData.push({
                    item_name: item.item_name,
                    cost: item.cost,
                    date: item.date.toLocaleDateString(), // Convert date to string for labeling
                    username: user.username,
                });
            });
        });

        res.json(graphData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
