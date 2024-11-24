require('dotenv').config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var createError = require('http-errors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var articleRouter = require('./routes/articles');

var app = express();
require("./models/connection")

const cors = require('cors');

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
// Middleware pour le parsing des requêtes
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Utilisation des routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/articles', articleRouter);  // Cette ligne doit être présente pour la gestion des articles
// app.use('/uploads', express.static(path.join(dirname, 'uploads')));

// Gestion des erreurs
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// app.use(function (err, req, res, next) {
//   res.status(err.status || 500).json({
//     message: err.message,
//     error: req.app.get('env') === 'development' ? err : {},
//   });
// });

module.exports = app;
