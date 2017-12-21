var express = require('express');
var bodyParser = require('body-parser');
var Verify = require('./verify');
var User = require('../models/user');
var Orders = require('../models/orders');
var status = require('http-status');
var _ = require('underscore');

var api = express.Router();
api.use(bodyParser.json());

 /* User API */
api.get('/', Verify.verifyOrdinaryUser, function(req, res, next) {
    // Another layer of authentication
    if (!req.user) {
      return res.
        status(status.UNAUTHORIZED).
        json({ err: 'No req.user property' });
    }

    req.user.populate('data.cart.product')
      .exec(function (err, user) {
          if(err) next(err);

          res.json(user);
      });
});

api.put('/cart', Verify.verifyOrdinaryUser, function(req, res, next) {
    try {
      var cart = req.body.data.cart;
    } catch(e) {
        return res.
          status(status.BAD_REQUEST).
          json({ err: 'No cart specified!' });
      }

    req.user.data.cart = cart;
    req.user.save(function(err, user) { 
      if (err) {
          return res.
            status(status.INTERNAL_SERVER_ERROR).
            json({ err: err.toString() });
      }

      return res.json({ user: user });
    });
});

/* Place Order API */
api.post('/placeorder', Verify.verifyOrdinaryUser, function(req, res, next) {  

    var totalCost = 0;

    try {
      var cart = req.body.data.cart;
    } catch(e) {
        return res.
          status(status.BAD_REQUEST).
          json({ err: 'No cart specified!' });
      }

    _.each(cart, function(item) {
          totalCost += item.product.price * item.quantity;
    });

    Orders.create({postedBy: req.decoded._id}, function(err, order) {
        if (err) next(err);

        order.cart = cart;
        order.totalCostGHS = totalCost;
        order.phoneNumber = req.body.phonenumber;

        order.save(function(err, order) {
            if(err) next(err);
            
            req.user.data.cart = [];
            req.user.save(function(err, user) {
            // Ignore any errors - if we failed to empty the user's
            // cart, that's not necessarily a failure

                return res.json({ order: order, user: user });
            });
        })
    });

});

module.exports = api;
