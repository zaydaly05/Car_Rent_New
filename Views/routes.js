const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const app = express();
const User = require('./Models/dataUsersSchema'); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'Views', 'views'));
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
app.get("/User_Dashboard", (_req, res) => {
    res.render('User_Dashboard');
});


app.get('/showroom/luxury', (req, res) => {
    res.render('ShowRoom_Luxury');
});

app.get('/showroom/sedan', (req, res) => {
    res.render('ShowRoom_Sedan');
});

app.get('/showroom/sports', (req, res) => {
    res.render('ShowRoom_Sports');
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
