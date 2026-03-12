var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// ==============================
// View Engine Setup (EJS)
// ==============================

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ==============================
// Middleware
// ==============================

app.use(logger('dev'));

app.use(express.json());

// This is important for form data
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Static files (CSS, JS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// ==============================
// Routes
// ==============================

app.use('/', indexRouter);
app.use('/users', usersRouter);

// ==============================
// Catch 404 Error
// ==============================

app.use(function(req, res, next) {
  next(createError(404));
});

// ==============================
// Error Handler
// ==============================

app.use(function(err, req, res, next) {

  res.locals.message = err.message;

  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);

  res.render('error');

});

// ==============================

module.exports = app;