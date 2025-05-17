const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rentalRequestsSchema = new Schema({
   Car_name: String,
    Category: Number,
    NoOfDays: Number,
    totalPrice: Number,
    rentalDate: { type: Date, default: Date.now },
});

const rentOrdersSchema = new Schema({
    rentalRequests: [rentalRequestsSchema],
    totalPrice: Number,
    rentalDate: { type: Date, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: 'dataUsersSchema' }  // Reference to the User schema
});


const Rent_Order = mongoose.model('Rent_Order', rentOrdersSchema);

module.exports = Rent_Order;