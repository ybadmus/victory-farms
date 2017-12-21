var express = require('express');
var bodyParser = require('body-parser');
var Enquiries = require('../models/enquiries');
var Verify = require('./verify');

var enquiryRouter = express.Router()
enquiryRouter.use(bodyParser.json())

enquiryRouter.route('/')
.get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Enquiries.find(req.query) 
        .exec(function(err, enquiries) {
           if (err) next(err);
           res.json(enquiries);
        });
})
.post(function(req, res, next) {
    Enquiries.create(req.body, function(err, enquiry) {
        if (err) next(err);
        console.log('Enquiry received!');
        var id = enquiry._id;
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Added the enquiry with id: ' + id);
    });
})
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Enquiries.remove({}, function(err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});

enquiryRouter.route('/:enquiryId')
.get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Enquiries.findById(req.params.enquiryId, function(err, enquiry) {
        if (err) next(err);
        res.json(enquiry);
    });
})
.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Enquiries.findByIdAndUpdate(req.params.enquiryId, {$set: req.body}, { new: true }, 
        function (err, enquiry) {
            if (err) next(err);
            res.json(enquiry);
    });
})
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {  
    Enquiries.findByIdAndRemove(req.params.enquiryId, function(err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});

module.exports = enquiryRouter;
