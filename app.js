const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const app = express();
const PORT = process.env.PORT || 5900;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Testing_for_expense_manag', {
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
}));
app.use(flash());
app.use(express.static('public'));

// Routes
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.get("/",(req,res)=>
{
    res.render("index.ejs");
});
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
