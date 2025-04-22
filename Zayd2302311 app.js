const express=require('express');
const app= express(); 
const path=require('path');

app.get('/login', function(req,res){
    res.sendFile(path.join(__dirname, "login.html"))
});
app.get('/profile', function(req,res){
    res.sendFile(path.join(__dirname, "profile.html"))
});
app.listen(3000);