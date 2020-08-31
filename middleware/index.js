var Showroom   = require("../models/showroom.js");
var Comment    = require("../models/comment.js");
var User       = require("../models/user.js");    

//All The Middleware Are In This File

var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		req.flash("error", "Please Login First!"); //always use flash before redirect
		res.redirect("/login");
	}
}


middlewareObj.isRightUser = function(req, res, next){
	if(req.isAuthenticated()){
		Showroom.findById(req.params.id, function(err, foundShowroom){
		if(err){
			req.flash("error","Showroom Not Found.");
			res.redirect("back");
		}
		else{
			//Check If User Owns The Showroom
			if(foundShowroom.user.id.equals(req.user._id )|| req.user.admin){
				next();
			}
			else{
				req.flash("error","You Do Not Have Permission.");
				res.redirect("back");
			}
		}
		});	
	}
	else{
		req.flash("error","Please Login First!");
		res.redirect("back");	
	}
}


middlewareObj.isRightUserComment = function(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.c_id, function(err, foundComment){
		if(err){
			res.redirect("back");
		}
		else{
			//Check If User Owns The Comment
			if(foundComment.author.id.equals(req.user._id) || req.user.admin){
				next();
			}
			else{
				req.flash("error","You Do Not Have Permission.");
				res.redirect("back");
			}
		}
		});	
	}
	else{
		req.flash("error","Please Login First!");
		res.redirect("back");
	}
}

middlewareObj.isRightUserProfile = function(req, res, next){
	if(req.isAuthenticated()){
		User.findById(req.params.id, function(err, foundUser){
		if(err){
			req.flash("error","User Not Found.");
			res.redirect("back");
		}
		else{
			//Check If User Owns The Profile
			if(foundUser.id.str===req.user._id.str){
				next();
			}
			else{
				req.flash("error","You Do Not Have Permission.");
				res.redirect("back");
			}
		}
		});	
	}
	else{
		req.flash("error","Please Login First!");
		res.redirect("back");	
	}
}

module.exports = middlewareObj;