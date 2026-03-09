const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/form', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'form.html'));
});

router.post('/submit', (req, res) => {
  const { name, email } = req.body;
  res.send(`Form submitted! Name: ${name}, Email: ${email}`);
});

module.exports = router;
