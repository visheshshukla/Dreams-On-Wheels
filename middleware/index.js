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




module.exports = middlewareObj;