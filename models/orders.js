var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var itemSchema = new Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1
    }
});

var orderSchema = new Schema({
	postedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	cart: [itemSchema],
	totalCostGHS: Number,
	phoneNumber: String
}, {
	timestamps: true
});

var Orders = mongoose.model('Order', orderSchema); 

module.exports = Orders;