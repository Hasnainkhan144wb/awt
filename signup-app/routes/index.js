var express = require('express');
var router = express.Router();

/* GET signup page */
router.get('/signup', function(req, res, next) {
  res.render('signup');
});

/* POST signup form */
router.post('/signup', function(req, res, next) {

  const { name, email, password } = req.body;

  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Password:", password);

  res.send("Signup Successful");

});

module.exports = router;