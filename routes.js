const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const Cars = require('./Models/carsSchema');
const User = require('./Models/dataUsersSchema');
const Rent_Order = require('./Models/rentOrders');
const multer = require('multer');
const methodOverride = require('method-override');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public', 'Images'));
    },
    filename: function (req, file, cb) {
        // Save with unique name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

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
    res.render('thankyou');
});
app.get("/User_Dashboard", async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const orders = await Rent_Order.find({ user: req.session.user._id }).sort({ rentalDate: -1 });

    // Find one of each type
    let completed, payment, booking;
    for (const order of orders) {
        const reqData = order.rentalRequests[0];
        // Completed
        if (!completed && order.status === 'completed') {
            completed = {
                type: 'completed',
                image: '/images/pic05.jpg',
                date: order.rentalDate ? order.rentalDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : '',
                title: 'Rental Completed',
                car: reqData?.Car_name
            };
        }
        // Payment (assuming every order is a payment)
        if (!payment) {
            payment = {
                type: 'payment',
                image: '/images/pic04.jpg',
                date: order.rentalDate ? order.rentalDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : '',
                title: 'Payment Received',
                amount: `$${order.totalPrice}`,
                car: reqData?.Car_name
            };
        }
        // Booking
        if (!booking && order.status === 'booked') {
            booking = {
                type: 'booking',
                image: '/images/pic06.jpg',
                date: order.rentalDate ? order.rentalDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : '',
                title: 'New Booking',
                car: reqData?.Car_name,
                from: reqData?.startDate
                    ? reqData.startDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
                    : '',
                to: reqData?.endDate
                    ? reqData.endDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
                    : ''
            };
        }
        // Stop if we have all three
        if (completed && payment && booking) break;
    }

    // Only include the ones that exist
    const recentActivity = [completed, payment, booking].filter(Boolean);

    res.render('usd', {
        user: req.session.user,
        recentActivity
    });
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
            // Redirect based on role
            if (user.Role === 'admin') {
                res.send(`<script>window.top.location.href='/admin-dashboard';</script>`);
            } else {
                res.send(`<script>window.top.location.href='/User_Dashboard';</script>`);
            }
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
        let imagePath;
        if (req.file) {
            imagePath = '/Images/' + req.file.filename;
        }
        const car = new Cars({
            Name,
            Price,
            Category,
            ImagePath: imagePath // Save the path, not the buffer
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

app.put('/edit-car/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, brand, type, category, status, price, ratings } = req.body;
        let updateData = {
            Name: name,
            Brand: brand,
            Type: type,
            Category: category,
            Status: status,
            Price: price,
            Ratings: ratings ? ratings.split(',').map(r => Number(r.trim())).filter(r => !isNaN(r)) : []
        };

        // If a new image was uploaded, save its relative path
        if (req.file) {
            updateData.ImagePath = '/Images/' + req.file.filename;
        }

        await Cars.findByIdAndUpdate(req.params.id, updateData);
        // Instead of res.redirect(...), use:
        res.send(`<script>window.top.location.href='/showroom';</script>`);
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
    const { carId, userId, NoOfDays, registration, startDate, endDate } = req.body;
    const days = Number(NoOfDays);
    if (!carId || !userId || isNaN(days) || !startDate || !endDate) {
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
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            rentalDate: new Date()
        }],
        totalPrice,
        rentalDate: new Date(),
        user: userId
    });
    await rentOrder.save();
    res.redirect('/thank_you');
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

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/upcoming-popup', async (req, res) => {
    if (!req.session.user) return res.status(401).send('Login required');
    const orders = await Rent_Order.find({ user: req.session.user._id }).sort({ rentalDate: -1 });
    const upcoming = orders[0] || null;
    res.render('upcoming', { upcoming });
});

app.get('/totalr-popup', async (req, res) => {
    if (!req.session.user) return res.status(401).send('Login required');
    const orders = await Rent_Order.find({ user: req.session.user._id });
    const totalRentals = orders.length;
    res.render('totalr', { totalRentals });
});

app.get('/payments-popup', async (req, res) => {
    if (!req.session.user) return res.status(401).send('Login required');
    const orders = await Rent_Order.find({ user: req.session.user._id }).sort({ rentalDate: -1 });
    const lastPayment = orders[0] ? {
        amount: orders[0].totalPrice,
        date: orders[0].rentalDate,
        car: orders[0].rentalRequests[0]?.Car_name
    } : null;
    const allPayments = orders.map(order => ({
        amount: order.totalPrice,
        date: order.rentalDate,
        car: order.rentalRequests[0]?.Car_name
    }));
    res.render('payments', { lastPayment, allPayments });
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