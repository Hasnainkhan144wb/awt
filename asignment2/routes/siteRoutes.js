const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to the Express Server!');
});

router.get('/about', (req, res) => {
  res.send('This is the About page.');
});

router.get('/home', (req, res) => {
  res.redirect('/');
});

router.get('/contact', (req, res) => {
  res.send('Contact us at contact@domain.com');
});

router.get('/greet', (req, res) => {
  const name = req.query.name;
  res.send(`Hello, ${name ? name : 'Stranger'}!`);
});

module.exports = router;
