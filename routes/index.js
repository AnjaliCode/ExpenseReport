var express = require('express');
var router = express.Router();

// GET home page with login partial and the default layout 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Index Page' });
});

module.exports = router;
