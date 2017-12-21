// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var cartSchema = new Schema({
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

var User = new Schema({
    username: {
        type: String,
        required: true
    },
    password: String,
    picture: {
      type: String,
      match: /^http:\/\//i
    },
    oauthId: String,
    oauthToken: String,
    firstname: {
    	type: String,
    	default: ""
    },
    lastname: {
    	type: String,
    	default: ""
    },
    admin: {
        type: Boolean,
        default: false
    },
    data: {
        cart: [cartSchema]
    }
}, {
    timestamps: true
});

//Instance method
User.methods.getName = function() {
	return (this.firstname + ' ' + this.lastname);
};

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);