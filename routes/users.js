var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var Verify = require('./verify');

var User = require('../models/user');

var router = express.Router();
router.use(bodyParser.json());

// GET all users listing.
router.get('/', Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
  User.find({}, function(err, user) {
    if (err) throw err;
        res.json(user);
  })
});

//Register New User.
router.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username }),
      req.body.password, function(err, user) {
        if (err) {
            return res.status(500).json({err: err});
        }
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }
        user.save(function(err, user) {
            passport.authenticate('local')(req, res, function () {
              return res.status(200).json({status: 'Registration Successful!'});
            });
        });
    });
});

//Login User..
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ 
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }        
        var token = Verify.getToken({"username": user.username, "_id": user._id, "admin": user.admin});      
        res.status(200).json({
          status: 'Login successful!',
          success: true,
          token: token
        });
    });
  })(req,res,next);
});

//Logout Current User..
router.get('/logout', Verify.verifyOrdinaryUser, function(req, res, next) {
    req.logout();
    res.status(200).json({
      status: 'Bye!' 
    });
});

//FaceBook Login..
router.get('/facebook', passport.authenticate('facebook'),
  function(req, res) { });

//FaceBook Logout...
router.get('/facebook/callback', function(req, res, next) {
  passport.authenticate('facebook', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
        var token = Verify.getToken({"username": user.username, "_id": user._id, "admin": user.admin});
        res.status(200).json({
          status: 'Login successful!',
          success: true,
          token: token
        });
    });
  })(req,res,next);
});

module.exports = router;