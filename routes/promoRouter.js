var express = require('express');
var bodyParser = require('body-parser');
var Verify = require('./verify');

var Promotions = require('../models/promotions');
var mongoose = require('mongoose');

var promoRouter = express.Router()
promoRouter.use(bodyParser.json())

promoRouter.route('/')
.get(function(req,res,next){
        Promotions.find(req.query) 
        .exec(function (err, promo) {
        if (err) next(err);
        res.json(promo);
    });
})
.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
        Promotions.create(req.body, function (err, promo) {
        if (err) next(err);

        console.log('Promotion created!');
        var id = promo._id;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the promotion with id: ' + id);
    });
})
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
        Promotions.remove({}, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});

promoRouter.route('/:promoId')
.get(function(req,res,next){
        Promotions.findById(req.params.promoId, function (err, promo){
          if (err) next(err);
          res.json(promo);
        });
})
.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
      Promotions.findByIdAndUpdate(req.params.promoId, {$set: req.body}, {new: true}, 
        function (err, promo){
        if (err) next(err);
        res.json(promo);
      });
})
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
      Promotions.findByIdAndRemove(req.params.promoId, function (err, resp){        
        if (err) next(err);
        res.json(resp);
      });
});

promoRouter.route('/:promoId/comments')
.get(function(req, res, next){   
    Promotions.findById(req.params.promoId)
        .populate('comments.postedBy')
        .exec(function (err, promo) {
        if (err) next(err);
        res.json(promo.comments);
    });
})
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    Promotions.findById(req.params.promoId, function(err, promo){
        if (err) next(err);      
        //records id of user into postedBy object
        req.body.postedBy = req.decoded._id;
        promo.comments.push(req.body);
        promo.save(function (err, promo) {
            if (err) next(err);
            console.log('Comment Posted!');
            res.json(promo);
        });
    });
})
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next){
    Promotions.findById(req.params.promoId, function (err, promo) {
        if (err) next(err);
        for (var i = (promo.comments.length - 1); i >= 0; i--) {
            promo.comments.id(promo.comments[i]._id).remove();
        }
        promo.save(function (err, result) {
            if (err) next(err);
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Deleted all comments!');
        });
    });
});

promoRouter.route('/:promoId/comments/:commentId')
.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    
    Promotions.findById(req.params.promoId)
        .populate("comments.postedBy")
        .exec(function (err, promo) {
        if (err) next(err);
        res.json(promo.comments.id(req.params.commentId));
    });
})
.put(Verify.verifyOrdinaryUser, function (req, res, next) {
    // We delete the existing commment and insert the updated
    // comment as a new comment
    Promotions.findById(req.params.promoId, function (err, promo) {
        if (err) next(err);

        if (promo.comments.id(req.params.commentId).postedBy != req.decoded._id) {           
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }

        promo.comments.id(req.params.commentId).remove();
        req.body.postedBy = req.decoded._id;
        promo.comments.push(req.body);
        promo.save(function (err, promo) {
            if (err) next(err);
            console.log('Updated Comments!');
            res.json(promo);
        });
        
    });
})
.delete(Verify.verifyOrdinaryUser, function (req, res, next) {

    Promotions.findById(req.params.promoId, function (err, promo) {
        if (err) next(err);

        if (promo.comments.id(req.params.commentId).postedBy != req.decoded._id) {           
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }

        promo.comments.id(req.params.commentId).remove();
        promo.save(function (err, resp) {
            if (err) next(err);
            res.json(resp);
        });
    });
});

module.exports = promoRouter;