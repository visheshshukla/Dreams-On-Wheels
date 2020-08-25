var express 	= require("express");
var router   	= express.Router({mergeParams: true});
var Showroom   	= require("../models/showroom.js");
var Comment    	= require("../models/comment.js");
var middleware	= require("../middleware/index.js");

//=========================================================
//Comments Routes
//=========================================================

//Create Comment Form
router.get("/showrooms/:id/comments/new", middleware.isLoggedIn, function(req,res) {
	Showroom.findById(req.params.id, function(err, foundShowroom){
		if(err){
			console.log(err);
		}
		else{
			//getting back foundShowroom based on showroom id and passing data to page
				res.render("comments/new", {showroom: foundShowroom});
			
		}
	})

});

//Create Comment
router.post("/showrooms/:id/comments", middleware.isLoggedIn, function(req,res) {
	//lookup showroom using ID
		Showroom.findById(req.params.id, function(err, foundShowroom){
		if(err){
			req.flash("error","Unable To Add Comment.");
			res.redirect("/showrooms");
		}
		else{
		//Create Comment
		Comment.create(req.body.comment, function(err, comment){
			if(err){
					req.flash("error","Unable To Add Comment.");
					console.log(err);
					}
			else{
				//add username and id to commnet
				//req.user._id from local variables from app.js
				comment.author.id = req.user._id;
				//req.user.username from local variables from app.js
				comment.author.username = req.user.username; 
				//save comment
				comment.save();
				//saving comment to showroom for data association
				foundShowroom.comments.push(comment);
				//saving showroom
				foundShowroom.save();
				req.flash("success","Added Comment Successfully.");
				res.redirect("/showrooms/"+foundShowroom._id);
				}
			});
			
			}
	});
});

//Edit Comment
router.get("/showrooms/:id/comments/:c_id/edit", middleware.isRightUserComment ,function(req,res) {
		Comment.findById(req.params.c_id, function(err, foundComment){
		if(err){
			req.flash("error","Unable To Edit Comment.");
			res.redirect("back");
		}
		else{
			//getting back foundComment based on comment id and passing data to page
				res.render("comments/edit",{showroom_id: req.params.id , comment: foundComment});
			}	
	});
});

//Update Comment
router.put("/showrooms/:id/comments/:c_id", middleware.isRightUserComment, function(req,res) {
	//finding comment based on comment id and passing updated data
	Comment.findByIdAndUpdate(req.params.c_id, req.body.comment , function(err, foundComment){
		if(err){
			req.flash("error","Unable To Edit Comment.");
			res.redirect("back");
		}
		else{
			req.flash("success","Edited Comment Successfully.");
			res.redirect("/showrooms/" + req.params.id);
		}
	});
});

//Delete Comment
router.delete("/showrooms/:id/comments/:c_id", middleware.isRightUserComment, function(req, res){
	//finding comment based on comment id and deleting
	Comment.findByIdAndRemove(req.params.c_id, function(err){
		if(err){
			req.flash("error","Unable To Delete Comment.");
			res.redirect("back");
		}
		else{
			req.flash("success","Deleted Comment Successfully.");
			res.redirect("/showrooms/"+req.params.id);
		}
	});	
});
	

module.exports = router; 