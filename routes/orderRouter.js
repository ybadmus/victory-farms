var express = require('express');
var Orders = require('../models/orders');
var Verify = require('./verify');
var bodyParser = require('body-parser');

var orderRouter = express.Router();
orderRouter.use(bodyParser.json());

orderRouter.route('/')

//get all orders.
.get(function (req, res, next) {
	Orders.find(req.query)
	    .populate('postedBy')
	    .populate('cart.product')
	    .exec(function (err, orders) {
	      	if (err) next(err);

	      	res.json(orders);
	    });
})
//Add an order to orders collection. Administrator Only
.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
	Orders.create(req.body, function (err, order) {
		if (err) next(err);

		console.log('Order Created!');
		var id = order._id;
		res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Added the product with id: ' + id);
	});
})
//Delete all orders.
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
	Orders.remove({}, function (err, resp) {
		if (err) next(err);

		res.json(resp);
	});
});

orderRouter.route('/:orderId')

//get order.
.get(function (req, res, next) { 
    Orders.findById(req.params.orderId)
        .populate('postedBy')
        .populate('cart.product')
        .exec(function (err, order) {
            if (err) next(err);
            
            res.json(order);
        });
})
//update order by setting req.body property.
.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
	Orders.findByIdAndUpdate(req.params.orderId, { $set: req.body }, { new: true }, 
		function (err, order) {
		    if (err) next(err);

		    res.json(order);
	    });
})
//delete order.
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
	Orders.findByIdAndRemove(req.params.orderId, function (err, resp) {
		if (err) next(err);

        res.json(resp);
	});
});

orderRouter.route('/:orderId/cart')

//get items in cart
.get(function(req, res, next) {
	Orders.findById(req.params.orderId)
	    .populate('cart.product')
	    .exec(function (err, order) {
            if (err) next(err);

            res.json(order.cart);
	    });
})
// add items to cart.
.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Orders.findById(req.params.orderId, function (err, order) {
    	if (err) next(err);

        //req.body should have product _id and quantity.
    	order.cart.push(req.body);
    	order.save(function (err, order) {
    		if (err) next(err);

    		console.log('Added item to Order');
    		res.json(order);
    	});
    });
})
;
// delete route not available, you can't delete everything in cart.

orderRouter.route('/:orderId/cart/:itemId')

//get specific item in cart.
.get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Orders.findById(req.params.orderId)
        .populate('cart.product')
        .exec(function (err, order) {
            if (err) next(err);

            res.json(order.cart.id(req.params.itemId));
        });

})
// update item in cart, example could be updating quantity.
.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Orders.findById(req.params.orderId, function (err, order) {
        if (err) next(err);

    	order.cart.id(req.params.itemId).remove();
    	order.cart.push(req.body);
    	order.save(function (err, order) {
    		if(err) next(err);

    		console.log('Item Updated In Cart');
    		res.json(order.cart);
    	});
    });
})
// delete specific item in cart.
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Orders.findById(req.params.orderId, function (err, order) {
    	if (err) next(err);

    	order.cart.id(req.params.itemId).remove();
        order.save(function (err, order) {
        	if (err) next(err);
            
            console.log('Item Deleted from Cart');
            res.json(order.cart);
        });
    });
});

module.exports = orderRouter;