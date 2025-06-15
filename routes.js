const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const Cars = require('./Models/carsSchema');
const User = require('./Models/dataUsersSchema');
const Rent_Order = require('./Models/rentOrders');
const multer = require('multer');
const upload = multer();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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
    const Role = "user"; // Default role for new signups
    const newUser = new User({ FullName, Email, Phone, Password, licence, car, Role });
    newUser.save()
        .then(() => {
            res.redirect('/login');
        })
        .catch((err) => {
            if (err.code === 11000) {
                res.status(400).send('<span style="color: red;">Email or phone already registered</span>');
            } else {
                console.error("Error registering user:", err);
                res.status(500).send('<span style="color: red;">server error</span>');
            }
        });
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


app.get("/contact",(req, res) => {
    res.render("contact.ejs");
});

app.get("/about",(req, res) => {
    res.render("about");
});

app.post('/rent', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('You must be logged in to rent a car.');
    }
    const { carId, NoOfDays } = req.body;
    try {
        const car = await Cars.findById(carId); // Use Cars, not Car
        if (!car) return res.status(404).send('Car not found.');

        const totalPrice = car.Price * NoOfDays; // Use lowercase if that's your schema

        const rentOrder = new Rent_Order({
            rentalRequests: [{
                Car_name: car.Name,
                Category: car.Category,
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

app.get("/readm", (req, res) => {
    res.render("Readmore");
});

// Show all cars (GET)
app.get('/showroom', async (req, res) => {
    try {
        const cars = await Cars.find({}); // Use correct model and field name
        res.render('ShowRoom_Luxury', { cars, user: req.session.user });
    } catch (err) {
        res.status(500).send('Error fetching cars');
    }
});

app.post('/showroom/add', upload.single('image'), async (req, res) => {
    try {
        const { Name, Price, Category } = req.body;
        const image = req.file
            ? { data: req.file.buffer, contentType: req.file.mimetype }
            : undefined;

        const car = new Cars({
            Name,
            Price,
            Category,
            image
        });
        await car.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Error adding car' });
    }
});
app.get("/All_Cars", async (req, res) => {
    try {
        const cars = await Cars.find({});
        res.render('All_Cars', { cars });
    } catch (err) {
        res.status(500).send('Error fetching cars');
    }
});
app.get("/alluser", async (req, res) => {
    try {
        const users = await User.find({});
        res.render('All_Users', { users });
    } catch (err) {
        res.status(500).send('Error fetching users');
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



// Add a new economy/sedan car (POST)


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
        const cars = await Cars.find({});
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
        await Cars.findByIdAndDelete(req.body.carId);
        res.redirect(req.body.redirectTo || '/showroom/sedan');
    } catch (err) {
        res.status(500).send('Error deleting car');
    }
});

app.get('/edit-car-popup/:id', async (req, res) => {
    try {
        const car = await Cars.findById(req.params.id);
        if (!car) return res.status(404).send('Car not found');
        res.render('Edit-car-form', { car, redirectTo: req.query.redirectTo || '/showroom/sedan' });
    } catch (err) {
        res.status(500).send('Error loading car for edit');
    }
});

app.post('/edit-car/:id', async (req, res) => {
    try {
        const { name, brand, type, category, status, price, image, ratings, redirectTo } = req.body;
        await Cars.findByIdAndUpdate(req.params.id, {
            Name: name,
            Brand: brand,
            Type: type,
            Category: category,
            Status: status,
            Price: price,
            Image: image,
            Ratings: ratings ? ratings.split(',').map(r => Number(r.trim())).filter(r => !isNaN(r)) : []
        });
        res.redirect(redirectTo || req.get('referer') || '/all-cars');
    } catch (err) {
        console.error("Error updating car:", err);
        res.status(500).send("Error updating car");
    }
});
app.get('/addcar', (req, res) => {
    res.render('add car');
});

app.get('/car-contract-popup', async (req, res) => {
    const { carId, userId } = req.query;
    if (!userId) {
        return res.status(401).send('You must be logged in to rent a car.');
    }
    const car = await Cars.findById(carId);
    const user = await User.findById(userId);
    res.render('car_contract', { car, user });
});

app.post('/rent/contract', async (req, res) => {
    const { carId, userId, NoOfDays, registration } = req.body;
    const days = Number(NoOfDays);
    if (!carId || !userId || isNaN(days)) {
        return res.status(400).send('Missing or invalid data');
    }
    const car = await Cars.findById(carId);
    if (!car || typeof car.Price !== 'number') {
        return res.status(400).send('Invalid car or car price');
    }
    const totalPrice = car.Price * days;
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
            Car_name: car.Name,
            Category: car.Category,
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

app.get('/admin-dashboard', async (req, res) => {
    try {
        // 1. Ratio of Category Rented
        const allOrders = await Rent_Order.find({});
        let categoryCounts = {};
        let totalRented = 0;
        allOrders.forEach(order => {
            order.rentalRequests.forEach(req => {
                categoryCounts[req.Category] = (categoryCounts[req.Category] || 0) + 1;
                totalRented++;
            });
        });
        let ratio = Object.entries(categoryCounts)
            .map(([cat, count]) => `${cat}: ${(count / totalRented * 100).toFixed(1)}%`)
            .join(', ');

        // 2. Average Accounts Registered per Month
        const users = await User.find({});
        let months = {};
        users.forEach(u => {
            const m = u.createdAt.getMonth() + 1;
            const y = u.createdAt.getFullYear();
            const key = `${y}-${m}`;
            months[key] = (months[key] || 0) + 1;
        });
        const avg = (users.length / Object.keys(months).length).toFixed(1);

        // 3. Total income per month
        let incomePerMonth = {};
        allOrders.forEach(order => {
            const m = order.rentalDate.getMonth() + 1;
            const y = order.rentalDate.getFullYear();
            const key = `${y}-${m}`;
            incomePerMonth[key] = (incomePerMonth[key] || 0) + (order.totalPrice || 0);
        });
        // Show the most recent month
        const latestMonth = Object.keys(incomePerMonth).sort().pop();
        const total_income = latestMonth ? incomePerMonth[latestMonth].toFixed(2) : '0';

        res.render('Admin Dashboard', {
            ratio,
            average: avg,
            total_income
        });
    } catch (err) {
        res.status(500).send('Error fetching statistics');
    }
});

app.get('/car-image/:id', async (req, res) => {
    const car = await Cars.findById(req.params.id);
    if (car && car.image && car.image.data) {
        res.contentType(car.image.contentType);
        res.send(car.image.data);
    } else {
        res.status(404).send('No image');
    }
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