const mongoose = require('mongoose');
const Schema =mongoose.Schema;

 const AddCar= new Schema ({
     Name: String,
     Price: Number,
    Category: String,
     image:{
        data:Buffer,
        contentType:String
     }  

    
 });

 const Device=mongoose.model("myCar",AddCar);



 module.exports=Cars;