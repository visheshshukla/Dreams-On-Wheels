//Campground Schema Setup For Database
var mongoose   = require("mongoose");

var showroomSchema = new mongoose.Schema({
	name: String,
	image: String,
	imageId: String,
	des: String,
	contact: String,
	location: String,
   	longitude: Number,
  	latitude: Number,
	user:{
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "user"
		},
		username: String
	},
	comments: [ 
		{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment"
	} 
	] 
});

module.exports = mongoose.model("Showroom",showroomSchema);
