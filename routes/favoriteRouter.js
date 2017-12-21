var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Verify = require('./verify');

var Favorite = require('../models/favorites');
var Product = require('../models/products');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorite.findOne({"postedBy": req.decoded._id}) 
        .populate('postedBy')
        .populate('dishes')
        .exec(function (err, favorite) {
            if (err) next(err);
            res.json(favorite);
    });
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
        Favorite.find({'postedBy': req.decoded._id})
            .exec(function (err, favorites) {
                if (err) next(err);
                
                if (favorites.length) {
                    var favoriteAlreadyExist = false;

                    if (favorites[0].dishes.length) {
                        for (var i = (favorites[0].dishes.length - 1); i >= 0; i--) {
                            if(favorites[0].dishes[i] == req.body._id) {
                                favoriteAlreadyExist = true;
                                res.end('Favorite already exists in your list!');
                                break;
                            }   
                        };
                    }

                    if (!favoriteAlreadyExist) {
                        favorites[0].dishes.push(req.body._id);
                        favorites[0].save(function (err, favorite) {
                            if (err) next(err);
                            console.log('Favorite Added!');
                            res.json(favorite);
                        });
                    }

                } else {

                    Favorite.create({postedBy: req.decoded._id}, function (err, favorite) {
                        if (err) next(err);

                        favorite.dishes.push(req.body._id);
                        favorite.save(function (err, favorite) {
                            if (err) next(err);
                            console.log('Favorite Added!');
                            res.json(favorite);
                        });
                    })
                }
            });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Favorite.remove({}, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});

favoriteRouter.route('/:dishId')
.delete(Verify.verifyOrdinaryUser, function (req, res, next){
	Favorite.findOne({postedBy: req.decoded._id}, function (err, favorites) {
            if (err) next(err);

            for (var i = (favorites.dishes.length - 1); i >= 0; i--) {
                if (favorites.dishes[i] == req.params.dishId) {
                    favorites.dishes.remove(req.params.dishId);
                    break;
                }
            };

            favorites.save(function (err, favorite) {
                if (err) next(err);
                console.log('Favorite Item Deleted!');
                res.json(favorite);
            });

    });
});

module.exports = favoriteRouter;