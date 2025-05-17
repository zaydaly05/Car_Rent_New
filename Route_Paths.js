const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const port = 5500;

// Middleware
app.use(express.static(path.join(__dirname, 'FrontEnd')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.get('/frontPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'FrontEnd',  'welcome.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'FrontEnd', 'HTML', 'login.html'));
    if(req.query.username.includes('_ad')) {
        return res.sendFile(path.join(__dirname, 'FrontEnd', 'HTML', 'Admin Dashboard.html'));
              
    }
    else if (req.query.username.includes('_us')) {
        return res.sendFile(path.join(__dirname, 'FrontEnd', 'HTML', 'User Dashboard.html'));
    }

});

app.get('/shE', (req, res) => {
    res.sendFile(path.join(__dirname, 'FrontEnd', 'HTML', 'ShowRoom_Economy.html'));
});

app.get('/ShS', (req, res) => {
    res.sendFile(path.join(__dirname, 'FrontEnd', 'HTML', 'ShowRoom Sports.html'));
});

app.get('/ShL', (req, res) => {
    res.sendFile(path.join(__dirname, 'FrontEnd', 'HTML', 'ShowRoom Luxury.html'));
});




















// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
