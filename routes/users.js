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

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'vishesh123', 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET
});

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
	if(req.body.adminPassword == process.env.ADMIN_SECRET)
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

//Profile Page
router.get("/users/:id",function(req,res) {
	//finding user by id and passing data of foundUser then redirecting to profile page
	User.findById(req.params.id, function(err, foundUser){
		if(err){
			req.flash("error", "User Not Found.");
			res.redirect('back');			
		}
		else{
			//finding all campgrounds linked to user
			Showroom.find().where('user.id').equals(foundUser._id).exec(function(err, foundShowrooms){
			if(err){
				req.flash("error", "User Not Found.");
				res.redirect('back');
			}
			else{
			res.render("user" , {user: foundUser, showrooms: foundShowrooms});
			}
			});
		}
	});
});

//Edit Profile
router.get("/users/:id/edit", middleware.isRightUserProfile, function(req,res) {
		User.findById(req.params.id, function(err, foundUser){
		if(err){
				req.flash("error","Unable To Edit User Profile.");
				res.redirect("back");
		}
		else{
			//getting back foundUser based on user id and passing data to page
				res.render("userEdit",{user: foundUser});
			}	
	});
});

//Update Profile
router.put("/users/:id", middleware.isRightUserProfile, upload.single('image'), function(req, res) {
    //cloudinary.v2.uploader.upload(req.file.path, function(err,result) {
	  User.findById(req.params.id, async function(err, foundUser){
			if(err){
				req.flash("error","Profile Edit Failed.");
				res.redirect("back");
			}
			else{
				if (req.file) {
				try{
					if(foundUser.avatarId === "emp")
						{
						//uploading new image to cloudinary
						var result = await cloudinary.v2.uploader.upload(req.file.path);
						// add cloudinary url and id for the image to the campground object under image property
						foundUser.avatar = result.secure_url;
						foundUser.avatarId = result.public_id;	
					}
					else{
						//if user already has a avatar image then deleting it from cloudinary
						await cloudinary.v2.uploader.destroy(foundUser.avatarId);
						var result = await cloudinary.v2.uploader.upload(req.file.path);
						// add cloudinary url and id for the image to the campground object under image property
						foundUser.avatar = result.secure_url;
						foundUser.avatarId = result.public_id;
					}
				}
				catch(err){
					req.flash("error", err.messgae);
					return res.redirect("back");
				}
				}
				//updating foundUser details
				foundUser.fname = req.body.user.fname;
				foundUser.lname = req.body.user.lname;
				foundUser.dob = req.body.user.dob;
				foundUser.email = req.body.user.email;
				foundUser.about = req.body.user.about;
				//saving the updated data of foundUser
				foundUser.save();
				req.flash("success","Edited Profile Sucessfully.");
				res.redirect("/users/" + foundUser._id);
			}
	  });
	});
//});



module.exports = router; 
