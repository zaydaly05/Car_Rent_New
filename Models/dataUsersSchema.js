const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Registeration = new Schema({
    FullName: String,
    Email: String,
    Address: String,
    Password: String,
    type:String,
    Photo: {
        data: Buffer,
        contentType: String
    }
}); 

const User = mongoose.model('User', Registeration);

module.exports = User;