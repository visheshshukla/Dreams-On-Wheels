var express    		= require("express");
var app        		= express();
var bodyParser		= require("body-parser");
var Showroom   		= require("./models/showroom.js");
var showroomRoutes  = require("./routes/showrooms.js");



//Routes
app.use(showroomRoutes);


app.listen(3000,function() {
	console.log("Website has started");
});
	