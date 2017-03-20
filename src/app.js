//===============CREATE ROOT PATH=================
var path = require('path');
global.appRoot = path.resolve(__dirname);

var express = require('express');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var morgan = require('morgan')
//===============MONGODB=================

var mongoConfig = require('./config').mongoConfig
global.db = mongoose.connection;


db.on('error', console.error.bind(console, '\x1b[31mERROR\x1b[0m: unable to connect to mongoDB on ' + mongoConfig.host + ' server'));
db.once('open', function () {
  console.info("\x1b[32minfo\x1b[0m:", "Connected to mongoDB on " + mongoConfig.host + " server");
});

mongoose.connect('mongodb://'+ mongoConfig.host +'/' + mongoConfig.base);

//===============CREATE APP=================
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//=============CREATE LOGGER===============

app.use(morgan('\x1b[32minfo\x1b[0m: :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]', {
  skip: function (req, res) { return res.statusCode < 400 && req.url != "/" && req.originalUrl.indexOf("/api") < 0 }
}));

//===============PASSPORT=================
global.passport = require('passport');
var expressSession = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(expressSession);
app.use(expressSession({
    secret: 'JkSwjJcqnfJ6NAzi9fjsTWfKLgRm',
    resave: true,
    store: new MongoDBStore({
      uri: 'mongodb://' + mongoConfig.host + '/express-session',
      collection: 'attendance'
    }),
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 60 * 1000 // 30 minutes
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require(appRoot + '/passport/init');
initPassport(passport);

//===============ROUTES=================
app.all('*', function (req, res, next) {
    if (req.path === '/logout/' || req.path === '/login/') return next();
    // if user is authenticated in the session, call the next() to call the next request handler
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    else if (req.isAuthenticated()) return next();
    // if the user is not authenticated then redirect him to the login page
    else return res.redirect('/login/');
});
var login = require('./routes/login');
app.use('/', login);
var index = require('./routes/home');
app.use('/home/', index);
var user = require('./routes/user');
app.use('/user/', user);
var api = require('./routes/api');
app.use('/api/', api);

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
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  if (err.status == 404) err.message = "The requested url "+req.originalUrl+" was not found on this server.";
  res.status(err.status || 500);
  res.render('error', {
    status: err.status,
    message: err.message,
    error: {}
  });
});

//===============CREATE CRON=================

var CronJob = require("cron").CronJob;
var getAcsData = require(appRoot + "/bin/acs");
try {
    new CronJob({
        cronTime: "0 */1 * * * *",
        onTick: function () {
            getAcsData();
        },
        start: true
    });
} catch (ex) {
    console.error("\x1b[31mERROR\x1b[0m:", "cron pattern not valid");
}

module.exports = app;
