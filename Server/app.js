/* MAIN BACKEND APP.JS */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hash = require('./routes/encode').hash;

var Sequelize = require("sequelize");
var connect = require('connect');
var http = require('http');
var session = require('express-session');
var Q = require('q');

// LOCAL DB
var db = new Sequelize('mydb', 'root', '', { // YOU MUST FIRST CREATE A DB IN MYSQL CALLED mydbname
  host: "localhost",
  port: 3306,
  dialectOptions: {
     charset: 'utf8mb4',
     supportBigNumbers: true,
     multipleStatements: true
  }
})

	Users = db.define('users', {

		  username: {
				type: Sequelize.STRING, unique: true,  primaryKey: true
		  },
		  password: {
		  		type: Sequelize.STRING
		  },
		  salt: {
		  		type: Sequelize.STRING
		  },
		  email: {
		  		type: Sequelize.STRING, unique: true
		  },
		  resetToken: {
		  		type: Sequelize.STRING,
		  		default: "-1"
		  },
		  tokenExpiresAt: {
		  		type: Sequelize.DATE
		  }
		},
		{
		  freezeTableName: true // Model tableName will be the same as the model name
		});

	db.sync();

// routes
var routes = require('./routes/index');
var signUp = require('./routes/signUp');
var resetPassword = require('./routes/resetPassword');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'something_very_secret',
  cookie : { secure : false, maxAge : (10 * 365 * 24 * 60 * 60 * 1000) }, // 10 yrs
}));

app.use(express.static(path.join(__dirname, 'public')));

// Session-persisted message middleware
app.use(function(req, res, next){

  req.db = db;
  next();
});

app.use('/', routes);
app.use('/signUp', signUp);
app.use('/resetPassword', resetPassword);

app.post('/logout', function (req,res){

	req.session.user = null ;

	req.session.destroy(function(err) {
  		// cannot access session here
		console.log("logging out user.");
		res.send('logged out.');
	});
});

app.post('/checkSession', function(req, res){
	console.log(" in the session function ");

	if ( req.session && req.session.user ){ // ALREADY LOGGED IN
			res.send(req.session.user);
			return "SESSION_ACTIVE" ;
	}
	else{
		console.log('session does not exist');
		res.send('LOGIN_FAIL');
	}
});

app.post('/login', function(req, res){
	console.log(" in the login function ");

	var email =  req.body.params.email.toLowerCase();

    authenticate(req, email, req.body.params.password, function(err, user){

			console.log(" after auth function ");
			if (user) {

				console.log(" login > user ");
			  // Regenerate session when signing in
			  // to prevent fixation
			   req.session.regenerate(function(){
				// Store the user's primary key
				// in the session store to be retrieved,
				// or in this case the entire user object
				req.session.user = user;
				req.session.username = req.body.params.username;

				console.log(" saving session user ");
				res.send(req.session.user);
			  });
			} else {

			  console.log(" throwing error, user not found ");

			  res.send('LOGIN_FAIL');
			}
  });
});

function authenticate(req, email, password, fn) {

	console.log(" auth with:" + email + ": , " + password);

		Users.findOne({
			  where: {email: email}
			}).then(function(user) {

			  if (!user){
				console.log("cannot find user");
				return fn(new Error('cannot find user'));
			  }

		hash(password, user.salt, function(err, hash){
			if (err) return fn(err);

			if (hash == user.password) {
				console.log(" hash = user passcode");
				 return fn(null, user);
			}

			fn(new Error('invalid password'));

		  });
	}).catch(function(error) {
		console.log(" cannot find user " + error);
		return fn(new Error('cannot find user'));

		});

	console.log(" end of auth fn ");
}


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
