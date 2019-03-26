var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var exphbs = require('express-handlebars');
var session = require('express-session');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var messages = require('express-messages');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var passportHttp = require('passport-http');

// NoSQL database with ORM and connection to database named: 'Expenses'
var mongodb = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Expenses');
var db = mongoose.connection;

//Importing routes on app page
var index = require('./routes/index');
var users = require('./routes/users');
var expenses = require('./routes/expenses');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'layout', partialsDir  : [
        //  path to partials
        path.join(__dirname, 'views/partials'),
    ]}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));// changed sequence since it breaks code
app.use(cookieParser());

// For Login session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// For validation errors on any form
app.use(expressValidator());

// messaging if required
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(require('stylus').middleware(path.join(__dirname, 'public')));

// Routing middleware
app.use('/', index);
app.use('/users', users);
app.use('/expenses', expenses);

//To make user is available on any page if he is logged in
app.get('*', function(req, res, next){
  req.user = req.user || false;
  console.log('req.user in any route: ', req.user);
  app.locals.user = req.user;
  app.locals.type = req.user.type;
  next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(8080, function(){
  console.log('Server listening at port 8080.....');
});

module.exports = app;
