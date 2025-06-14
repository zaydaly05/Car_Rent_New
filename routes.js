const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const User = require('./Models/dataUsersSchema'); 
const Rent_Order = require('./Models/rentOrders');

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
            req.session.user = user;
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
            req.session.user = user;
            res.send(`<script>window.top.location.href='/User_Dashboard';</script>`);
        } else {
            res.status(401).send('<span style="color: red;">Invalid email or password</span>');
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("Server error");
    }
});
app.get('/thank_you', (req, res) => {
    res.render('thankyou.html');
});
app.get("/User_Dashboard", async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    try {
        const orders = await Rent_Order.find({ user: req.session.user._id }).sort({ rentalDate: -1 });
        res.render('usd', { user: req.session.user, orders });
    } catch (err) {
        res.status(500).send('Error loading dashboard');
    }
});

app.get('/register', (req, res) => {//popup
    res.render('signup');
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get("/User_Dashboard", (req, res) => {
    res.render('usd.ejs', { user: req.session.user || null });
});

app.post('/login', async (req, res) => {
    const { Email, Password } = req.body;
    try {
        const user = await User.findOne({ Email, Password });
        if (user) {
            req.session.user = user; // Save user in session
            res.redirect('/usd.ejs'); // Redirect to dashboard
        } else {
            res.status(401).send('<span style="color: red;">Invalid email or password</span>');
        }
    } catch (err) {
        res.status(500).send('Server error');
    }
});


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
app.post("/showroom/sedan/add", async (req, res) => {
    const { name, brand, type, price, image } = req.body;
    const car = new Car({
        name,
        brand,
        type,
        category: 'Economy', // or 'Sedan' if that's your category name
        price,
        image // For simplicity, use a URL or base64 string for now
    });
    try {
        await car.save();
        // Respond with the new car as JSON for AJAX
        res.json({
            _id: car._id,
            name: car.name,
            brand: car.brand,
            type: car.type,
            price: car.price,
            image: car.image
        });
    } catch (err) {
        res.status(500).json({ error: 'Error adding car' });
    }
})


// Show all cars (GET)
app.get('/showroom/luxury', async (req, res) => {
    try {
        const cars = await Car.find({ category: 'Luxury' }); // Filter by category if needed
        res.render('ShowRoom_Luxury', { cars, user: req.session.user });
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
        res.render('ShowRoom_Sports', { cars, user: req.session.user });
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

app.post('/delete-rent', async (req, res) => {
    try {
        await Rent_Order.findByIdAndDelete(req.body.orderId);
        res.redirect('/all-rent');
    } catch (err) {
        res.status(500).send('Error deleting rental order');
    }
});

// Show all economy/sedan cars (GET)
app.get('/showroom/sedan', async (req, res) => {
    try {
        const cars = await Car.find({ category: 'Economy' }); // or 'Sedan' if that's your category name
        res.render('ShowRoom_Economy', { cars, user: req.session.user });
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

app.post('/delete-user', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.body.userId);
        res.redirect('/all-users');
    } catch (err) {
        res.status(500).send('Error deleting user');
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
app.get("/usd", (req, res) => {
   res.render("usd");
});

app.post('/delete-car', async (req, res) => {
    try {
        await Car.findByIdAndDelete(req.body.carId);
        res.redirect(req.body.redirectTo || '/showroom/sedan');
    } catch (err) {
        res.status(500).send('Error deleting car');
    }
});

app.get('/edit-car-popup/:id', async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) return res.status(404).send('Car not found');
        res.render('Edit-car-form', { car, redirectTo: req.query.redirectTo || '/showroom/sedan' });
    } catch (err) {
        res.status(500).send('Error loading car for edit');
    }
});

app.post('/edit-car/:id', async (req, res) => {
    try {
        const { name, brand, type, category, status, price, image, ratings, redirectTo } = req.body;
        await Car.findByIdAndUpdate(req.params.id, {
            name,
            brand,
            type,
            category,
            status,
            price,
            image,
            ratings: ratings ? ratings.split(',').map(r => Number(r.trim())).filter(r => !isNaN(r)) : []
        });
        res.redirect(redirectTo || req.get('referer') || '/all-cars');
    } catch (err) {
        console.error("Error updating car:", err);
        res.status(500).send("Error updating car");
    }
});

app.get('/car-contract-popup', async (req, res) => {
    const { carId, userId } = req.query;
    if (!userId) {
        return res.status(401).send('You must be logged in to rent a car.');
    }
    const car = await Car.findById(carId);
    const user = await User.findById(userId);
    res.render('car_contract', { car, user });
});

app.post('/rent/contract', async (req, res) => {
    const { carId, userId, NoOfDays, registration } = req.body;
    const days = Number(NoOfDays);
    if (!carId || !userId || isNaN(days)) {
        return res.status(400).send('Missing or invalid data');
    }
    const car = await Car.findById(carId);
    if (!car || typeof car.price !== 'number') {
        return res.status(400).send('Invalid car or car price');
    }
    const totalPrice = car.price * days;
    if (isNaN(totalPrice)) {
        return res.status(400).send('Invalid total price calculation');
    }
    if (registration) {
        await User.findByIdAndUpdate(userId, {
            Registeration: registration
        });
    }
    const rentOrder = new Rent_Order({
        rentalRequests: [{
            Car_name: car.name,
            Category: car.category,
            NoOfDays: days,
            totalPrice,
            rentalDate: new Date()
        }],
        totalPrice,
        rentalDate: new Date(),
        user: userId
    });
    await rentOrder.save();
    res.redirect('/User_Dashboard');
});

mongoose.connect("mongodb+srv://omar:123@cars.chdtnqe.mongodb.net/?retryWrites=true&w=majority&appName=cars") 
.then(() => {
    app.listen(5500,()=>{
    console.log("Server is running on port 5500 and connected to MongoDB");
});
})
.catch((err) => {
    console.error("Error connecting to MongoDB or server:", err);
});