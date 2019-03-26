var express = require('express');
var router = express.Router();

var mongodb = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Expenses');
var db = mongoose.connection;
var User = require('../models/users');
var Expenses = require('../models/expenses');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var passportHttp = require('passport-http');
var bcrypt = require('bcryptjs');

// Middleware for passport
router.use(passport.initialize());
router.use(passport.session());

// Ensure Authentication middleware
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated() && (req.user.type == 'Employee') ){
    next();
  }
  else next(err);
}

// Listing employee's own list of Expenses: Individual account management
router.get('/', ensureAuthenticated, function(req, res, next) {
  var user = req.user;
  //console.log('user in /users route: ', user);
    Expenses.getExpensesByUsername(req.user.username, function(err, expenses){
      if(err) throw err;
      res.render('users/index', {expenses: expenses, user: user});
    });
});

// Registration page for any user whether Employee or Amdin
router.get('/registration', function(req, res, next) {
  res.render('users/registration');
});

// Registration of Employee or Admin
router.post('/registration', function(req, res, next) {
  // entire registartion process
  var username = req.body.username;
  var password = req.body.password;
  var confirmPassword = req.body.confirmPassword;
  var type = req.body.type;
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var address = req.body.address;
  req.checkBody('username', 'Username field can not be empty').notEmpty();
  req.checkBody('password', 'Password field can not be empty').notEmpty();
  req.checkBody('type', 'Type field can not be empty').notEmpty();
  req.checkBody('password', 'Passwords should match').equals(req.body.confirmPassword);
  req.checkBody('last_name', 'Last Name field can not be empty').notEmpty();
  req.checkBody('address', 'Address field can not be empty').notEmpty();

var errors = req.validationErrors();
console.log('errors: ', errors);
if(errors) res.render('users/registration', {errors: errors});
else {
  var newUser = new User({username: username, password: password, type: type,
    first_name: first_name, last_name: last_name, address: address});

  User.createUser(newUser, function(err, user){
    if(err) throw err;
    console.log('User: ', user);
  });
  res.location('/');
  res.redirect('/');
}
});

// Defining Local Strategy of Passport
passport.use(new LocalStrategy(function(username, password, done){
  User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
      console.log('There is no user with this username');
      return done(null, false, {message: 'Invalid User'});
    }

    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch == true) {
        console.log('Password is correct');
        return done(null, user);
      }
      else if(isMatch == false){
        console.log('Password is incorrect');
        return done(null, false, {message: 'Invalid password'});
      }
    });
  });
}));

// Login module for Employees
router.post('/login',passport.authenticate('local', {failureRedirect: '/', failureFlash: true, session: true}),
function(req, res, next){
  console.log('Login successful');
  res.location('/users');
  res.redirect('/users');
});

// Enabling for repeat access to object
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// Enabling for repeat access to object
passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

//Logout module connected to login partial
router.get('/logout', function(req,res){
  user = false;
  req.logout();
  res.location('/');
  res.redirect('/');
});

//CRUD functionality

// A form for creating a Expense for Employee by the same employee
router.get('/add', ensureAuthenticated, function(req, res, next){
    var user = req.user;
    res.render('users/add', {user: user});
});

//Creating a new Expense of Employee
router.post('/add', ensureAuthenticated, function(req, res, next){
  var username = req.user.username;
  var type = req.body.type;
  var Time = new Date();
  var amount = req.body.amount;
  var currency = req.body.currency;
  var description = req.body.description;

  if(!currency) currency = "USD";

req.checkBody('amount', 'Amount field is not empty').notEmpty();
req.checkBody('description', 'Description field is not empty').notEmpty();

var errors = req.validationErrors();

if(errors) {
  res.render('users/add', {errors: errors});
}
else {
  var expense = new Expenses({username: req.user.username, type: type, Time: new Date(), amount: amount, currency: currency, description: description});

  Expenses.createNewExpense(expense, function(err, expenseCreated){
    if(err) throw err;
    console.log('expenseCreated: ', expenseCreated);
    //req.flash('success','Expense added');
    res.location('/users');
    res.redirect('/users');
  });
}

});

//Edit form for new Expense by employee
router.get('/edit/:id',ensureAuthenticated, function(req, res, next) {
  var username = req.user.username;
  Expenses.findWithID(req.params.id, username ,function(err, expense){
    if(err) throw err;
    console.log('expense: ', expense);
    if(expense){
      res.render('users/edit', {expense: expense, username: req.user.username});
    }
    else next(err);
  });
});


//Updating his own existing Expense by an employee
router.post('/edit/:id', ensureAuthenticated, function(req, res, next) {

  var username = req.user.username;
  var type = req.body.type;
  var Time = new Date();
  var amount = req.body.amount;
  var currency = req.body.currency;
  var description = req.body.description;

  if(!currency) currency = "USD";

  Expenses.update({_id:req.params.id, username: username},
    {$set: {username: username, type:type, Time: new Date(), amount: amount, currency: currency, description: description}},
    {safe: true, upsert: true},
    function(err){
    if(err) throw err;
    res.location('/users');
    res.redirect('/users');
  });
});

// Deleting his own expense by the employee
router.get('/delete/:id', ensureAuthenticated, function(req, res, next) {
  var username = req.user.username;
  var id = req.params.id;
  Expenses.remove({_id: req.params.id, username: username}, function(err){
    if(err) throw err;
    res.location('/users');
    res.redirect('/users');
  });
});


module.exports = router;
