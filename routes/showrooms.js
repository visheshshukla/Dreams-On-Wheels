var express = require("express");
var router = express.Router();
var Showroom  = require("../models/showroom.js");
var middleware = require("../middleware/index.js");
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

var rp				= require('request-promise');
var cors            = require('cors');

//=========================================================
//Showrooms Routes
//=========================================================

//Landing Page
router.get("/", function(req,res) {
	res.render("landing");
});

//Index Route
router.get("/showrooms",function(req,res) {
	Showroom.find({},function(err,allShowrooms){
		if(err){
				console.log(err);
				}
		else{
			//passing the data of allshowrooms from database to page
				res.render("showrooms/index",{showrooms:allShowrooms});
			}
	});
});

//New Showroom Form Page
router.get("/showrooms/new", middleware.isLoggedIn, function(req,res) {
	res.render("showrooms/new");
});

//Create Showroom 
router.post("/showrooms", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err,result) {
      // getting address and id of showroom image and adding it to showroom template 
      req.body.showroom.image = result.secure_url;
	  req.body.showroom.imageId = result.public_id;
      // adding user data to showroom template
      req.body.showroom.user = {
        id: req.user._id,
        username: req.user.username
      }
		//sending location data to mapbox
	   rp(`https://api.mapbox.com/geocoding/v5/mapbox.places/${req.body.showroom.location}.json?access_token=${process.env.MAPBOX}`)
		.then(resp=>JSON.parse(resp))
		.then(result=>{
		//getting latitude and longitude then adding it to showroom template
			const [longitude,latitude] = result.features[0].center;
		    req.body.showroom.latitude = latitude;
		    req.body.showroom.longitude = longitude;
		//creating new showroom in database
     		Showroom.create(req.body.showroom, function(err, createdShowroom) {
        	if (err) {
          		req.flash("error","Unable To Add New Showroom.");
				console.log(err);
				res.redirect('back');
        	}
			req.flash("success","New Showroom Added Successfully.");
        	res.redirect('/showrooms/');
      		});
   		 });
	});
});

//Show A Particular Showroom
router.get("/showrooms/:id",function(req,res) {
	Showroom.findById(req.params.id).populate("comments").exec(function(err, foundShowroom){
	if(err)
		{
			req.flash("error","Unable To Display.");
			console.log(err);
		}
		else{
			//getting back foundShowroom based on showroom id and passing data to page
			res.render("showrooms/show",{showroom: foundShowroom});		
		}
	});	
});

//Edit Showroom
router.get("/showrooms/:id/edit", middleware.isRightUser, function(req,res) {
		Showroom.findById(req.params.id, function(err, foundShowroom){
		if(err){
				req.flash("error","Unable To Edit.");
				res.redirect("back");
		}
		else{
			//getting back foundShowroom based on showroom id and passing data to page
				res.render("showrooms/edit",{showroom: foundShowroom});
			}	
	});
});

//Update Showroom
router.put("/showrooms/:id", middleware.isRightUser, upload.single('image'), function(req,res) {
	//Find the showroom and update 
	//Getting the location form using req.body.showroom
	const location = req.body.showroom.location;
	//sending location data to mapbox
	rp(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${process.env.MAPBOX}`)
		.then(resp=>JSON.parse(resp))
		.then(result=>{
		//getting latitude and longitude
			const [longitude,latitude] = result.features[0].center;
			req.body.showroom.longitude = longitude;
			req.body.showroom.latitude = latitude;
			Showroom.findById(req.params.id, async function(err, foundShowroom){
			if(err){
				req.flash("error","Edit Failed.");
				res.redirect("/showrooms");
			}
			else{
			//getting back foundShowroom based on showroom id
			if (req.file) {
				try{
					//if showroom already has a image then deleting it from cloudinary
					await cloudinary.v2.uploader.destroy(foundShowroom.imageId);
					//uploading new image to cloudinary
					var result = await cloudinary.v2.uploader.upload(req.file.path);
					// add cloudinary url and id for the image to the campground object under image property
					foundShowroom.image = result.secure_url;
					foundShowroom.imageId = result.public_id;
					
				}
				catch(err){
					req.flash("error", err.messgae);
					return res.redirect("back");
				}
				}
				//updating foundShowroom details
				foundShowroom.name = req.body.showroom.name;
				foundShowroom.contact = req.body.showroom.contact;
				foundShowroom.des = req.body.showroom.des;
				foundShowroom.location = req.body.showroom.location;
				foundShowroom.latitude = latitude;
				foundShowroom.longitude = longitude;
				//saving the updated data foundShowroom
				foundShowroom.save();
				req.flash("success","Successfully Edited.");
				res.redirect("/showrooms/" + foundShowroom._id);
			}
		});
	});
});


//Delete Showroom
router.delete("/showrooms/:id", middleware.isRightUser, function(req, res){
	Showroom.findById(req.params.id, async function(err, foundShowroom){
		if(err){
				req.flash("error","Unable To Delete.");
				res.redirect("/showrooms");
		}
		else{
			//getting back foundShowroom based on showroom id
				try{
					//deleting image from cloudinary
					await cloudinary.v2.uploader.destroy(foundShowroom.imageId);
					//deleting the foundShowroom from database
					foundShowroom.remove();
					req.flash("success","Showroom Deleted.");
					res.redirect("/showrooms");
				}
				catch(err){
					req.flash("error", err.messgae);
					return res.redirect("back");
				}
		}
	});	
});


	
module.exports = router; 
