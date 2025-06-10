const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const app = express();
const User = require('./Models/dataUsersSchema'); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'yourSecretKey', // Change this to a strong secret in production
    resave: false,
    saveUninitialized: true
}));
app.set('views', path.join(__dirname, 'Views'));
app.set("view engine", "ejs");

app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

app.get('/', (req, res) => {
    res.render('welcome');
});
app.post("/register", (req, res) => {
    const { FullName, Email, Phone, Password, licence, car } = req.body;
    const newUser = new User({ FullName, Email, Phone, Password, licence, car });
    newUser.save()
        .then((user) => {
            req.session.user = { name: user.FullName, email: user.Email ,Password: user.Password};
            res.render('login');
        })
        .catch((err) => {
            console.error("Error registering user:", err);
            res.status(500).send('<span style="color: red;">Email already taken</span>');
        });
});
app.post('/login', async (req, res) => {
    const { Email, Password } = req.body;
    try {
        const user = await User.findOne({ Email, Password });
        if (user) {
            req.session.user = { email: user.Email ,Password: user.Password, name: user.FullName };
            res.send(`<script>window.top.location.href='/User_Dashboard';</script>`);
        } else {
            res.status(401).send('<span style="color: red;">Invalid email or password</span>');
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("Server error");
    }
});
app.get('/register', (req, res) => {//popup
    res.render('signup');
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get("/User_Dashboard", (req, res) => {
    res.render('User_Dashboard', { user: req.session.user || null });
});

app.post('/login', async (req, res) => {
    const { Email, Password } = req.body;
    try {
        const user = await User.findOne({ Email, Password });
        if (user) {
            req.session.user = user; // Save user in session
            res.redirect('/User_Dashboard'); // Redirect to dashboard
        } else {
            res.status(401).send('<span style="color: red;">Invalid email or password</span>');
        }
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.get('/showroom/luxury', (req, res) => {
    res.render('ShowRoom_Luxury');
});

app.get('/showroom/sedan', (req, res) => {
    res.render('ShowRoom_Sedan');
});

app.get('/showroom/sports', (req, res) => {
    res.render('ShowRoom_Sports');
});*/


const Car = require('./car rent/models/car'); // Use this everywhere

app.post('/rent', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('You must be logged in to rent a car.');
    }
    const { carId, NoOfDays } = req.body;
    try {
        const car = await Car.findById(carId); // Use Car, not Cars
        if (!car) return res.status(404).send('Car not found.');

        const totalPrice = car.price * NoOfDays; // Use lowercase if that's your schema

        const rentOrder = new Rent_Order({
            rentalRequests: [{
                Car_name: car.name,
                Category: car.category,
                NoOfDays,
                totalPrice
            }],
            totalPrice,
            user: req.session.user._id
        });

        await rentOrder.save();
        res.redirect('/User_Dashboard');
    } catch (err) {
        console.error('Rental error:', err);
        res.status(500).send('Error processing rental.');
    }
});


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


app.get('/all-rent', async (req, res) => {
    try {
        const orders = await Rent_Order.find().populate('user');
        res.render('all_rent', { orders });
    } catch (err) {
        console.error('All-rent error:', err);
        res.status(500).send('Error fetching rental orders.');
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