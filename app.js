var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var io = require('socket.io');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var io = io.listen(app.listen(3001));
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//app.use('/', index);
app.use('/users', users);
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

app.get('/controller', function(req, res){
	console.log("testing",req);
	var data={"TorqueControllerName": "Smart", "Timestamp": "2017-10-12 10:11:20", "TorqueMaxLimit": 001800, "TorqueMinLimit":"001525", "TorqueStatus": 1, "TighteningID": "ID 201", "Torque": 001559};
	io.sockets.emit("message_to_client",data);
	res.json(data);
})

app.post('/smartlab', function(req, res){
  console.log("Result...",req,req.body);
  io.sockets.emit("message_to_client",req.body.DATA);
})

app.post('/smartlabs', function(req, res){
	console.log("Result...",req,req.body);
	io.sockets.emit("message_to_client",req.body);
  res.json({});
})

io.on('connection', function (socket) {
	socket.on("message_to_client", function(userdata) {
		console.log("U received data");
	});
	socket.on("disconnect",function(data)
    {
      console.log("one socket disconnected...")
    });
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
