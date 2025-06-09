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
            res.send(`<script>window.top.location.href='/User_Dashboard';</script>`);
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
