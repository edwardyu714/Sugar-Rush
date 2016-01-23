///////////////////////////////////////////////////////////////////////*
//                                                                    //
//                               Notes                                //
// No path npm, no expressSession npm                                 //
//                                                                    //
////////////////////////////////////////////////////////////////////////

// Give variables to all the npms to make them easier to access.
var express = require('express'); // Express is the core framework
var app = express(); // Function in exress to run application
var methodOverride = require('method-override');
var bodyParser = require('body-parser'); // Lets you parse data
var logger = require('morgan'); // Logs messages to help you build
var mongoose = require('mongoose'); // Database npm
var passport = require('passport'); // Helps with authentication
var VenmoStrategy = require('passport-venmo').Strategy; // ?
var request = require('request') //?
var users_controller = require('./controllers/usersController.js'); // ?
var http = require('http'); //?
var path = require('path'); //?
var cookieParser = require('cookie-parser'); // Allows app to store cookies
var dotenv = require('dotenv').config(); // ??? Something with environment vars


// This connects the site to the local mongo-db
mongoose.connect('mongodb://localhost/sugar-rush');



var User = require('./models/user.js')["User"];
require('./config/passport')(passport)


// Loggs messages for development, as opposed to 'prod' for production
app.use(logger('dev'));

// Allows you to use json and clients like Insomia
// Second allows you to use url to post, view, delete, etc (rails does
// this automatically)
// Third lets the app read and save cookies.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ??? Starts up the passport module
// ??? Allows you to create sessions after login
app.use(passport.initialize());
app.use(passport.session());

///////////////
// app.set('views', path.join(__dirname, 'app/views'));
app.use(methodOverride());

app.use(passport.initialize());
app.use(passport.session());






// All our assets can be stored in the public folder
app.use(express.static(__dirname + '/public'));

// Passports - ??? requires the passport file, then the actual module
// ??????????? Broken below ??????????
//require('./config/passport')(passport)


// Allows us to access and use the routes files.
// The '/' binds routes to that root.
var routes = require('./config/routes');
app.use('/', routes);

// Copied routes

app.get('/', users_controller.index)

app.get('/auth/venmo', passport.authenticate('venmo', {
    scope: ['access_feed', 'access_profile', 'access_email', 'access_phone', 'access_balance', 'access_friends'],
    failureRedirect: '/'
}), users_controller.signin);

app.get('/auth/venmo/callback', passport.authenticate('venmo', {
    failureRedirect: '/'
}), users_controller.authCallback);





// ?????
// Sets the view engine to ejs, now you don't need to include ejs in
// calling the view pages.
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.listen(3000);
console.log("Ed's OCD");

////////////////////////////////////////////////////////////////////////


