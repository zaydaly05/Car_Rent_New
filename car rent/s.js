const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const User = require('./Models/dataUsersSchema'); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'Views', 'views'));
app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.render('welcome');
});
app.post("/register", (req, res) => {
    const { FullName, Email, Phone, Password, licence, car } = req.body;
    const newUser = new User({ FullName, Email, Phone, Password, licence, car });
    newUser.save()
        .then(() => {
            res.send(`<script>window.top.location.href='/User_Dashboard';</script>`); // submitting pop up form
        })
        .catch((err) => {
            console.error("Error registering user:", err);
            res.status(500).send('<span style="color: red;">Email already taken</span>'); // Show error in browser
        });
});

app.get('/register', (req, res) => {//popup
    res.render('signup');
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get("/User_Dashboard", (_req, res) => {
    res.render('new_userdasboard');
});

app.get("/AdminDashboard", (_req, res) => {
    res.render('Admin Dashboard');
});
const Car = require('./car rent/models/car'); // Adjust path if needed

// Show all cars (GET)
app.get('/showroom/luxury', async (req, res) => {
    try {
        const cars = await Car.find({ category: 'Luxury' }); // Filter by category if needed
        res.render('ShowRoom_Luxury', { cars });
    } catch (err) {
        res.status(500).send('Error fetching cars');
    }
});

// Add a new car (POST)
app.post('/showroom/luxury/add', async (req, res) => {
    try {
        const { name, brand, type, price, image } = req.body;
        const car = new Car({
            name,
            brand,
            type,
            category: 'Luxury',
            price,
            image // For simplicity, use a URL or base64 string for now
        });
        await car.save();
        res.redirect('/showroom/luxury');
    } catch (err) {
        res.status(500).send('Error adding car');
    }
});

// Show all sports cars (GET)
app.get('/showroom/sports', async (req, res) => {
    try {
        const cars = await Car.find({ category: 'Sports' });
        res.render('ShowRoom_Sports', { cars });
    } catch (err) {
        res.status(500).send('Error fetching cars');
    }
});

// Add a new sports car (POST)
app.post('/showroom/sports/add', async (req, res) => {
    try {
        const { name, brand, type, price, image } = req.body;
        const car = new Car({
            name,
            brand,
            type,
            category: 'Sports',
            price,
            image
        });
        await car.save();
        res.redirect('/showroom/sports');
    } catch (err) {
        res.status(500).send('Error adding car');
    }
});

// Show all economy/sedan cars (GET)
app.get('/showroom/sedan', async (req, res) => {
    try {
        const cars = await Car.find({ category: 'Economy' }); // or 'Sedan' if that's your category name
        res.render('ShowRoom_Economy', { cars });
    } catch (err) {
        res.status(500).send('Error fetching cars');
    }
});

// Add a new economy/sedan car (POST)
app.post('/showroom/sedan/add', async (req, res) => {
    try {
        const { name, brand, type, price, image } = req.body;
        const car = new Car({
            name,
            brand,
            type,
            category: 'Economy', // or 'Sedan'
            price,
            image
        });
        await car.save();
        res.redirect('/showroom/sedan');
    } catch (err) {
        res.status(500).send('Error adding car');
    }
});

app.get('/all-users', async (req, res) => {
    try {
        const users = await User.find({});
        res.render('All_Users', { users });
    } catch (err) {
        res.status(500).send('Error fetching users');
    }
});

app.get('/all-cars', async (req, res) => {
    try {
        const cars = await Car.find({});
        res.render('All_Cars', { cars });
    } catch (err) {
        res.status(500).send('Error fetching cars');
    }
});


mongoose.connect("mongodb+srv://omar:123@cars.chdtnqe.mongodb.net/?retryWrites=true&w=majority&appName=cars") 
.then(() => {
    app.listen(3000,()=>{
    console.log("Server is running on port 3000 and connected to MongoDB");
});
})
.catch((err) => {
    console.error("Error connecting to MongoDB or server:", err);
});
