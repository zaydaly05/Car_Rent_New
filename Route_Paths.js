const express=require('express');
const app= express(); 
const path=require('path');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const port=3000;


app.use(express.static(path.join(__dirname, 'FrontEnd')));
app.get('/frontPage', function(req,res){
    res.sendFile(path.join(__dirname, "FrontEnd/HTML","welcome.html"));
});
app.get('/dashboard', function(req,res){
    res.sendFile(path.join(__dirname, "User Dashboard.html"))
});
app.get('/shE', function(req,res){
    res.sendFile(path.join(__dirname, "ShowRoom_Economy.html"))
});
app.get('/ShS', function(req,res){
    res.sendFile(path.join(__dirname, "ShowRoom Sports.html"))
});
app.get('/ShL', function(req,res){
    res.sendFile(path.join(__dirname, "ShowRoom Luxury.html"))
});
app.listen(port);