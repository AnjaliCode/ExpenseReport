var mongodb = require('mongodb');
var mongoose = require('mongoose');
// Name of the database is 'Expenses' so the following URL
mongoose.connect('mongodb://localhost/Expenses');
var db = mongoose.connection;

var ExpensesSchema = mongoose.Schema({
  username: String,
  type: String,
  Time: String,
  amount: String,
  currency: String,
  description: String
});

var Expenses = module.exports = mongoose.model('Expenses', ExpensesSchema);

// Obtain everybody's expenses for Admin
module.exports.getExpenses = function(callback){
  Expenses.find(callback);
}

// Obtain expenses for username for employees
module.exports.getExpensesByUsername = function(username, callback){
  Expenses.find({username: username}, {}, callback);
}

// Obtain individual expense by mongoID
module.exports.getExpenseById = function(id, callback){
  Expenses.findById(id, callback);
}

// Creating a new expense by employee or Admin
module.exports.createNewExpense = function(newExpense, callback){
  newExpense.save(callback);
}

// Search expenses with username and id
module.exports.findWithID = function(id, username ,callback){
  Expenses.findOne({_id: id, username: username}, {}, callback);
}

// Search individual expense by ID
module.exports.findByID = function(id ,callback){
  Expenses.findOne({_id: id}, {}, callback);
}
