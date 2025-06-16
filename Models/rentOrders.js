const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rentalRequestsSchema = new Schema({
    Car_name: String,
    Category: String,
    NoOfDays: Number,
    totalPrice: Number,
    startDate: { type: Date, required: true }, // required for contract
    endDate: { type: Date, required: true },   // required for contract
    rentalDate: { type: Date, default: Date.now },
});

const rentOrdersSchema = new Schema({
    rentalRequests: [rentalRequestsSchema],
    totalPrice: Number,
    rentalDate: { type: Date, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});

const Rent_Order = mongoose.model('Rent_Order', rentOrdersSchema);

module.exports = Rent_Order;