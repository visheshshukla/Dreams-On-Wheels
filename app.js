var express    		= require("express");
var app        		= express();
var bodyParser		= require("body-parser");
var mongoose   		= require("mongoose");
var passport   		= require("passport");
var localStrategy	= require("passport-local"); 
var methodOverride  = require("method-override");
var flash    		= require("connect-flash");
var rp				= require('request-promise');
var cors            = require('cors');
var Showroom   		= require("./models/showroom.js");
var Comment    		= require("./models/comment.js");
var User	    	= require("./models/user.js");
var showroomRoutes  = require("./routes/showrooms.js");
var commentRoutes   = require("./routes/comments.js");
var userRoutes      = require("./routes/users.js");


mongoose.connect("mongodb://localhost/Dreams_On_Wheels",{
useNewUrlParser: true,
useUnifiedTopology: true,
useFindAndModify: false });
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(cors());



//Passport Configuration
app.use(require("express-session")({
	secret: "Carpe Diem",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Middleware
//Passing User Login Info To All Routes And Header(Login, Logout)
app.use(function(req, res, next){
   res.locals.currentUser = req.user; //passing to all routes and show showroom
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});



//Routes
app.use(showroomRoutes);
app.use(commentRoutes);
app.use(userRoutes);


app.listen(3000,function() {
	console.log("Website has started");
});
	