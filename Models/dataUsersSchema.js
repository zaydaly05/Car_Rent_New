const mongoose = require('mongoose');


const Schema = mongoose.Schema;

const Registeration = new Schema({
    FullName: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    Phone: { type: Number, required: true, unique: true },
    Role: { type: String, required: true },

    Password: { type: String, required: true },
    licence: { type: String, required: true },
    Registeration: { type: String , required: false }, // Add this line
    car: { type: String }, // Add this line
    createdAt: { type: Date, default: Date.now },
}); 

const User = mongoose.model('User', Registeration);

module.exports = User;