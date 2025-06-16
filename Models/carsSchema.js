const mongoose = require('mongoose');
const Schema =mongoose.Schema;

 const AddCar= new Schema ({
     Name: String,
     Price: Number,
    Category: String,
    ImagePath: String, 
 });

 const Cars =mongoose.model("myCar",AddCar);



 module.exports= Cars;