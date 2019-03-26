var express = require('express');
var router = express.Router();

var mongodb = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Expenses');
var db = mongoose.connection;
var Expenses = require('../models/expenses');
var User = require('../models/users');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var passportHttp = require('passport-http');
var bcrypt = require('bcryptjs');

// Passport middleware
router.use(passport.initialize());
router.use(passport.session());

//Middleware for Admin authentication
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated() && (req.user.type == 'Admin') ){
    next();
  }
  else next(err);
}

// Listing everybody's Expenses
router.get('/', ensureAuthenticated, function(req, res, next) {
    var user = req.user;
    Expenses.getExpenses(function(err, expenses){
      if(err) throw err;
      res.render('expenses', {expenses: expenses, user: user});
    });
});

// Defining Local Strategy
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

// Admin Login
router.post('/login',passport.authenticate('local', {failureRedirect: '/', failureFlash: true, session: true}),
function(req, res, next){
  console.log('Login successful');
  res.location('/expenses');
  res.redirect('/expenses');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

// Logout functionality
router.get('/logout', function(req,res){
  user = null;
  req.logout();
  req.flash('success', 'Admin logged out');
  res.location('/');
  res.redirect('/');
});

// CRUD functionality

// Add form for new Expense
router.get('/add', ensureAuthenticated, function(req, res, next){
    res.render('add');
});

// Create new Expense
router.post('/add', ensureAuthenticated, function(req, res, next){
  //Admin user name:
  var AdminUsername = req.user.username;
  var username = req.body.user;
  var type = req.body.type;
  var Time = new Date();
  var amount = req.body.amount;
  var currency = req.body.currency;
  var description = req.body.description;

  if(!currency) currency = "USD";

req.checkBody('username', 'User field is not empty').notEmpty();
req.checkBody('type', 'Type field is not empty').notEmpty();
req.checkBody('amount', 'Amount field is not empty').notEmpty();
req.checkBody('description', 'Description field is not empty').notEmpty();

var errors = req.validationErrors();

if(errors) {
  res.render('add', {errors: errors});
}

var expense = new Expenses({username: username, type: type, Time: Time, amount: amount, currency: currency, description: description});

Expenses.createNewExpense(expense, function(err){
  if(err) throw err;
  console.log('expense: ', expense);
  res.location('/expenses');
  res.redirect('/expenses');
});
});

//Edit form for Expense
router.get('/edit/:id', ensureAuthenticated, function(req, res, next) {
  Expenses.findByID(req.params.id, function(err, expense){
    if(err) throw err;
    console.log('expense: ', expense);
    res.render('edit', {expense: expense});
  });
});

//Update Expense
router.post('/edit/:id',ensureAuthenticated, function(req, res, next) {
  var username = req.body.username;
  var type = req.body.type;
  var Time = new Date();
  var amount = req.body.amount;
  var currency = req.body.currency;
  var description = req.body.description;

  if(!currency) currency = "USD";

  Expenses.update({_id:req.params.id},
    {$set: {type:type, Time: Time, amount: amount, currency: currency, description: description}},
    function(err){
    if(err) throw err;
    res.location('/expenses');
    res.redirect('/expenses');
  });
});

// Delete expense
router.get('/delete/:id', ensureAuthenticated, function(req, res, next) {
  Expenses.remove({_id: req.params.id}, function(err){
    if(err) throw err;
    res.location('/expenses');
    res.redirect('/expenses');
  });
});

module.exports = router;
