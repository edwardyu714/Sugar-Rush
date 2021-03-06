var express = require('express');
var User = require('../models/user');
var Order = require('../models/order');
var Restaurant = require('../models/restaurant');
var userController = require('./usersController');

module.exports = function (app, passport){

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

  // locally --------------------------------
      // LOGIN ===============================
      // show the login form
      // process the login form

      // SIGNUP =================================
      // show the signup form
      // process the signup form

    //this is necessary for user sessions on every page
    //looking for an existing session, and then the user through the email(username)
    //of that user
    // if(req.session && req.session.email){
    //   console.log(req.session)
    //   User.findOne( {email: req.session.email}).then( function (user){
    //     res.render('./users/home_page', {
    //
    //      this sets the user within the session as a variable that can be called
    //      on any page (curr_user)
    //            vvvvvvvvvvvv
    //       curr_user: user.email,
    //
    //       this allows passport to callback
    //       "return done(null, user)"
    //       users: null
    //     })
    //   })
    //    this defines the function to run asynchronously if the "if" statement cnanot be run
    //    if the user is not found, then they'll be redirected to the homepage
    //
    // } else{
    //   User.findAsync({})
    //     .then( function (users){
    //       res.render('./users/home_page', {
    //         curr_user: null,
    //         users: users
    //       });
    //     }).catch();
    //  req.session.save() is necessary on each page/route to resave the instance of the session on that page
    //  the current user will be defined and allow the navbar/any other instances that require a curr_user to run
    // }
    // req.session.save();


  app.get('/', function (req,res){
    if(req.session && req.session.email){
      console.log(req.session)
      User.findOne( {email: req.session.email}).then( function (user){
        res.render('./users/home_page', {
          curr_user: user.email,
          users: null
        })
      })
    } else{
      User.findAsync({})
        .then( function (users){
          res.render('./users/home_page', {
            curr_user: null,
            users: users
          });
        }).catch();
    }
    req.session.save();
  });

  app.get('/local/login', function (req, res){
    console.log(req.session)
    if(req.session && req.session.email){
        User.findOne({ email: req.session.email }).then(function(user){
            res.render('./users/profile',{
                curr_user: user.email,
                users: null,
                message: req.flash('loginMessage') });
        })
    }
    else{
        User.findAsync({})
            .then( function (users){
                res.render('./users/login', {
                    curr_user: null,
                    users: users,
                    message: req.flash('loginMessage') });
            }).catch();
    }
    req.session.save();
});

  app.post('/local/login', passport.authenticate('local-login', {
    successRedirect: '/local/profile',
    failureRedirect: '/local/login',
    failureFlash: true //allow flashing
  }));

  //
  app.get('/local/signup', function (req, res){
     if(req.session && req.session.email){
        User.findOne({ email: req.session.email }).then(function(user){
            res.render('./users/signup',{
                curr_user: user.email,
                users: null,
                message: req.flash('signupMessage') });
        })
    }
    else{
        User.findAsync({})
            .then( function (users){
                res.render('./users/signup', {
                    curr_user: null,
                    users: users,
                    message: req.flash('signupMessage') });
            }).catch();
    }
    req.session.save();
  });

  app.post('/local/signup', passport.authenticate('local-signup', {
    successRedirect: '/local/profile',
    failureRedirect: '/local/signup',
    failureFlash: true //allow flashing
  }))


// Search mongo for a user matching the id of the session user, the
// orders that were submitted by the session user, and all of the
// restaurants.
// Double for-loop through the restaurant data and push all the dessert
// item objects to an array called all_items
// For the order data, set up a datesArray and a dessertsArray. Loop
// through each order. Convert each item's date into an array of strings
// and build friendlier date strings and push them into datesArray. Name
// dessertsArray and quantitiesArray, Loop through each of the desserts
// from the order and through all of the dessert items. If the ids
// math, push the name of the item to the dessertsArray and the
// quantities to a quantitiesArray. Push each to the dessertsArrayArray
// Render the profile with the current user data, the item name, the
// quantities, and the date, then save the session


app.get('/local/profile', function (req, res){
   User.findById({_id: req.session.passport.user}, function (err, data){
     Order.find({user_id: req.session.passport.user}, function (err, data2){
       Restaurant.find({}, function(err, data3){

         var restaurants = data3;
         var all_items = [];
         for(i=0; i<restaurants.length; i++){
           currMenu = restaurants[i].menu;
           for(j=0; j<currMenu.length; j++){
             all_items.push(currMenu[j]);
           };
         };

         var orders = data2;
         var datesArray = [];
         var dessertsArrayArray = [];
         for (var i=0; i<orders.length; i++) {

           var oldDate = orders[i].created_at.toString().split(' ');
           var newDate = oldDate[1]+" "+oldDate[2]+", "+oldDate[3];
           datesArray.push(newDate);

           var desserts = orders[i].dessert_items;
           var dessertsArray = [];
           var quantitiesArray = [];
           for (j=0; j < desserts.length; j++) {
             for(k=0; k<all_items.length; k++){
               if(all_items[k].id == desserts[j].item_id){
                 dessertsArray.push(all_items[k].item);
               };
             };
             quantitiesArray.push(desserts[j].quantity);
           };
           dessertsArrayArray.push(dessertsArray);
           dessertsArrayArray.push(quantitiesArray);
         };

         res.render('./users/profile.ejs', {
           user: data,
           order_dates: datesArray,
           order_items: dessertsArrayArray,
           curr_user: data.local.email,
           users: null
         })

       })
     })
   })
   req.session.save();
 });

  app.get('/users/profile/edit/', function (req, res, next){
    User.findById({_id: req.session.passport.user}, function (err, data){
      res.render('./users/edit',{
        user: data,
        curr_user: data.local.email,
        users: null
      })
    })
    //PUT A RESPONSE HERE SO YOU CAN PING
    req.session.save();
  });


  app.post('/users/profile/edit/:id', function (req, res, next){
    console.log(req.session.passport.user)
    console.log(req.session)
    User.findById({_id: req.session.passport.user}, function (err, user){
      // console.log()
      // Order.find({}, function (err, data2){
      //   orderHistory: data2
      // })
      curr_user = req.body;
      console.log(curr_user);
    var keys = Object.keys(req.body);
    keys.forEach(function(key){
      user.local[key] = req.body[key];
      console.log(user.local)
      user.local.save();
      });
    console.log(req.session)
    res.render('./users/profile', {
      user: user,
      // orderHistory: data2,
      curr_user: user.local,
      users: null,
    })

    });
    req.session.save()
  });

  app.post('/users/delete/:id', function (req, res){
    console.log(req.session.passport.user)
    User.findOneAndRemove({_id: req.session.passport.user}, function (err, user){
      if (err) console.log(err);
      else console.log('user deleted')
        res.redirect('/')
    })
  });

    // =====================================
    // Venmo Authentication =====================
    // =====================================
    // route for venmo authentication and login
    app.get('/auth/venmo', passport.authenticate('venmo', {
      scope: ['access_feed', 'access_profile', 'access_email', 'access_phone', 'access_balance', 'access_friends'],
      failureRedirect: '/'
    }));

    app.get('/auth/venmo/callback', passport.authenticate('venmo', {
      successRedirect: '/local/profile',
      failureRedirect: '/'
    }));

    //logout
    app.get('/local/logout', function (req, res){
      req.logout();
      res.redirect('/');
    });

    app.use(function (req, res, next){
      res.locals.login = req.isAuthenticated();
      next();
    })

    app.use( function (req, res, next){
      app.locals.user = User.findById({_id : req.user})
      });
    //send to venmo for authentication
    // app.get('/connect/venmo', passport.authorize('venmo', {scope: 'email'}));

    // //callback after venmo authorizes
    // app.get('/connect/venmo/callback',
    //   passport.authorize('venmo',{
    //     successRedirect: './users/profile',
    //     failureRedirect: '/'
    //   }));


  //route middleware to make sure user is logged in
//   function isLoggedIn (req, res, next){

//     //if user is authenticated, then continue
//     if (req.isAuthenticated())
//       return next();
//     //if they aren't loggedin, redirect to home
//     res.redirect('/');
//   }
}
