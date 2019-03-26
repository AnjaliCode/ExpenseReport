var mongodb = require('mongodb');
var mongoose = require('mongoose');
// Name of my database is 'Expenses'
mongoose.connect('mongodb://localhost/Expenses');
var db = mongoose.connection;
// Meant for password hashing, any production level app needs hashed password
var bcrypt = require('bcryptjs');

var UserSchema = mongoose.Schema({
  username: String,
  password: String,
  type: String,
  first_name: String,
  last_name: String,
  address: String
});

var User = module.exports = mongoose.model('User', UserSchema);

// Create a new employee or admin
module.exports.createUser = function(newUser, callback){
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
        newUser.password = hash;
        newUser.save(callback);
    });
});
}

// Search employee or admin by username
module.exports.getUserByUsername = function(username, callback){
  User.findOne({username: username}, callback);
}

// Search employee or admin by ID
module.exports.getUserById = function(id,callback){
  User.findById(id, callback);
}

// Comparing logged in password with database password
module.exports.comparePassword = function(password, candidatePassword, callback){
      bcrypt.compare(password, candidatePassword, function(err, res){
        if(err) throw err;
        callback(null, res);
      });
  }
