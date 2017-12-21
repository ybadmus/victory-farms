var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Verify = require('./verify');

var Products = require('../models/products');

var productRouter = express.Router();
productRouter.use(bodyParser.json());

productRouter.route('/')
.get(function (req, res, next) {

    Products.find(req.query)
        .populate('comments.postedBy')
        .exec(function (err, product) {
            if (err) next(err);
            res.json(product);
        });
})

.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    Products.create(req.body, function (err, product) {
        if (err) next(err);
        console.log('Product created!');
        var id = product._id;

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Added the product with id: ' + id);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    Products.remove({}, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});

productRouter.route('/:productId')
.get(function (req, res, next) {

    Products.findById(req.params.productId)
        .populate('comments.postedBy')
        .exec(function (err, product) {
            if (err) next(err);
            res.json(product);
        });
})

.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    Products.findByIdAndUpdate(req.params.productId, {$set: req.body}, { new: true }, 
        function (err, product) {
        if (err) next(err);
        res.json(product);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    Products.findByIdAndRemove(req.params.productId, function (err, resp) {        
        if (err) next(err);
        res.json(resp);
    });
});

productRouter.route('/:productId/comments')

.get(function (req, res, next) {
    
    Products.findById(req.params.productId)
        .populate('comments.postedBy')
        .exec(function (err, product) {
            if (err) next(err);
            res.json(product.comments);
        });

})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {

    Products.findById(req.params.productId, function (err, product) {
        if (err) next(err);
        
        //records id of user into postedBy object
        req.body.postedBy = req.decoded._id;
        product.comments.push(req.body);
        product.save(function (err, product) {
            if (err) next(err);
            console.log('Comments Posted!');
            res.json(product);
        });
    });

})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {

    Products.findById(req.params.productId, function (err, product) {
        if (err) next(err);
        for (var i = (product.comments.length - 1); i >= 0; i--) {
            product.comments.id(product.comments[i]._id).remove();
        }
        product.save(function (err, result) {
            if (err) next(err);
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Deleted all comments!');
        });
    });
});

productRouter.route('/:productId/comments/:commentId')

.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    
    Products.findById(req.params.productId)
        .populate()
        .exec(function (err, product) {
            if (err) next(err);
            
            res.json(product.comments.id(req.params.commentId));
    });
})

.put(Verify.verifyOrdinaryUser, function (req, res, next) {
    // We delete the existing commment and insert the updated
    // comment as a new comment
    Products.findById(req.params.productId, function (err, product) {
        if (err) next(err);

        if (product.comments.id(req.params.commentId).postedBy != req.decoded._id) {           
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }

        product.comments.id(req.params.commentId).remove();
        req.body.postedBy = req.decoded._id;
        product.comments.push(req.body);
        product.save(function (err, product) {
            if (err) next(err);
            console.log('Updated Comments!');
            res.json(product);
        });
        
    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {

    Products.findById(req.params.productId, function (err, product) {
        if (err) next(err);

        if (product.comments.id(req.params.commentId).postedBy != req.decoded._id) {           
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }

        product.comments.id(req.params.commentId).remove();
        product.save(function (err, resp) {
            if (err) next(err);
            res.json(resp);
        });
    });
});

module.exports = productRouter;
