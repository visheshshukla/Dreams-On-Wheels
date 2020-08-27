var express 		= require("express");
var router 			= express.Router();
var passport   		= require("passport");
var User	    	= require("../models/user.js");
var Showroom		= require("../models/showroom.js");
var middleware 		= require("../middleware/index.js");

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//=========================================================
//Index Routes
//=========================================================

//New User Register
router.get("/register",function(req,res) {
res.render("register");
});


//New User Add
router.post("/register", function(req,res) {
	//passing username and other info to newUser template
	//passing the default image in cloudinary for avatar and avatarId==emp later checked in update route
	var newUser = new User({username: req.body.username, 
	fname: "", lname: "", avatar: "https://res.cloudinary.com/vishesh123/image/upload/v1589820758/avatar_ncyywy.png", 			avatarId: "emp" , dob: "", email: "", about: ""});
	//checking and Giving Admin Right To User
	if(req.body.adminPassword == 'godmode')
		{
			newUser.admin = true;
		}
	//passing the details of newUser template ; passing the user password seperately for encryption
	//passing the deatils to passport then database
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			req.flash("error",err.message);   //err.message here comes from databse and passport
			return res.redirect("/register");
			   }
		else{
			passport.authenticate("local")(req, res, function(){
			req.flash("success"," Sign Up Sucessfull. Welcome To Dreams On Wheels " + user.username);			
			res.redirect("/showrooms");	
			});
		}
	});
});
	
//Login Form
router.get("/login",function(req,res) {
res.render("login");
});

//Login Logic
router.post('/login', passport.authenticate('local', 
		{ 
		//login logic handled by passport
		successFlash : "Login Sucessfull. Welcome Back.",
		successRedirect: '/showrooms',
		failureFlash : "Invalid Credentials. Unable to Login",
        failureRedirect: '/login' 
		}
),function(req,res){});

//Logout Route
router.get("/logout",function(req,res) {
	//logout logic handled by passport
	req.logout();
	req.flash("success", "Logged Out Sucessfully.")
	res.redirect("/showrooms");
});




module.exports = router; 
