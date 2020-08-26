//User Schema Setup And Authentication
var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
//Password for Admin Mode = godmode

var UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	fname: String,
	lname: String,
	avatar: String,
	avatarId: String,
	dob: String,
	email: String,
	about: String,
	admin: {type: Boolean, default: false}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserSchema);