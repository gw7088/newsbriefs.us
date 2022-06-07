var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var request = require("request");
var CronJob = require('cron').CronJob;
var app = express();
// export SESSION_SECRET='t067t68PxfWbvY8JoGiYZCWJk0FFrOZB'
var session = require('express-session')({
	key: 'user_sid',
	secret: 't067t68PxfWbvY8JoGiYZCWJk0FFrOZB',
	resave: true,	// <-- This was false, before adding io session middleware
	saveUninitialized: true,	// <-- This was false, before adding io session middleware
	cookie: {
	  // maxAge: 600000
	  maxAge: 86400000
	}
});
var sharedsession = require("express-socket.io-session");


const
  admin = new (require('./bin/admin'))
  port = 8000;
  ;

// Socket.io server
const httpServer = require("http").createServer(app);
const options = { /* ... */ };
const io = require("socket.io")(httpServer, options);
// Socket handlers
io.on('connection',function(socket){
	initUserConnection(socket);
	userConnected(socket);
});
httpServer.listen(8000);

// Routes
const
  indexRouter = require('./routes/index'),
  mainRouter = require('./routes/mainpage'),
  userRouter = require('./routes/user')
  ;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Session
app.use(session);
io.use(sharedsession(
	session,
	{ autoSave:true } 
));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Hooking it up
app.use('/', indexRouter);
app.use('/main', mainRouter);
app.use('/user', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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


function userConnected(socket){
	// Get a token and assign it to the user, before we do anything else
	admin.getToken(function(token){
		// console.log(socket);
		setSocketData(socket,'uid',token);
		// console.log(socket);
	});
}

let userDataLoc = ['_uniqueData'];
function setSocketData(socket,key,val){
	if(!socket) return 'err: No socket defined';
	if(!socket[userDataLoc]) socket[userDataLoc] = [];
	socket[userDataLoc].key = val;
	return socket[userDataLoc].key;
}

// Handle requests from Socket.io
function initUserConnection(socket){
	socket
		.on('error',function(data){
			// let userdata = socket ? admin.getUserDataFromSocket(socket) : {};
			// let userid = userdata && userdata.id ? userdata.id : 0;
			// admin.log({
			// 	userid: userid,
			// 	type: 'socket error',
			// 	log: JSON.stringify({
			// 		data: data,
			// 		userdata: userdata
			// 	}),
			// 	isLive: isLive,
			// 	socket: socket,
			// });
		})
		.on('test socketio',function(data){
			admin.lets_test_socketIO(data,response =>{
				socket.emit('tested socketio',response);
			});
        })
        .on('get user information',function(data){
			admin.get_user_information(data,response =>{
				socket.emit('got user information',response);
			});
		})
		.on('load articles',function(data){
			admin.load_articles(data,response =>{
				socket.emit('articles loaded',response);
			});
		})
	  ;
}


/**
 * Runs every second
 */
function doEverySecond(){
	// console.log('Do Every second! ('+new Date().getSeconds()+')');
}


/**
 * Runs every day
 */
function doEveryDay(){
	// console.log('Do Every day! ('+new Date().getSeconds()+')');

	let bool = Math.floor(Math.random() * (1 - 0 + 1) + 0);
	if(bool==1){
		// Updates articles to use
		admin.grab_news_data_npr();
	}
}


/**
 * Runs every week
 */
function doEveryWeek(){
	// console.log('Do Every week! ('+new Date().getSeconds()+')');

	// // Updates articles to use
	// admin.grab_news_data_npr();
}


/**
 * Create the schedules
 */
function createScheduledTasks() {
	// -----> Tasks that run in general times...
    // createScheduledTask(doEverySecond,'sec');
    // createScheduledTask(doEvery5Seconds, '*/05 * * * * *');
	// createScheduledTask(doEvery15Seconds,'*/15 * * * * *');
	// createScheduledTask(doEvery30Seconds,'*/30 * * * * *');
	// createScheduledTask(doEveryMinute,'min');
	// createScheduledTask(doEvery15Minutes,'0 */15 * * * *');
	// createScheduledTask(doEvery30Minutes,'0 */30 * * * *');
	// createScheduledTask(doEveryHour,'hr');
	// createScheduledTask(doEveryHour2,'hr2');
	// createScheduledTask(doEveryHourAlternate,'0 50 * * * *');
	// createScheduledTask(doEveryHour10After,'10 * * * *');
	createScheduledTask(doEveryDay,'d');
	// createScheduledTask(doEveryWeek,'wk');
	// createScheduledTask(doEveryMonth,'mo');
}

/**
 * Creates a scheduled task by supplying a function and a schedule
 * @method createScheduledTask
 * @param  {function}		method   Code to execute at defined intervals
 * @param  {string}			schedule Allowed schedules are: second, minute, hour, day, week, month, year. You may also use cron notation like * * * * * * (seconds 0-59, minutes 0-59, hours 0-23, day of month 1-31, month 0-11, day of week 0-6 Sun-Sat)
 * @return {boolean}		Whether or not the scheduled task creation has succeeded
 */
function createScheduledTask(method,schedule){
	/*
	* SERVER TIME!
	* Be aware that the server is GMT
	* Therefore, if we want to run something around 4AM EST,
	* Then we should run the cron at '0 0 9 * * *'
	 */
	let err = '';
	// Validation
	if(typeof method=='undefined') err = 'ERROR: Cannot create scheduled task. Invalid schedule.\n  Allowed schedules are: minute, hour, day, week, month, year (). or standard cron notation such as "0 6 * * 1,2,3,4,5 *" to run a script daily on weekdays at 6am server time.';
	else if (typeof method!='function') err = 'First parameter "method" must a function.';
	if(typeof schedule=='undefined') console.log('ERROR: Cannot create scheduled task. Invalid schedule.\n  Allowed schedules are: minute, hour, day, week, month, year (). or standard cron notation such as "0 6 * * 1,2,3,4,5 *" to run a script daily on weekdays at 6am server time.');
	switch(schedule){
		case 'seconds': case 'second': case 'secs': case 'sec': case 'secondly':
			schedule='* * * * * *'; break;
		case 'minutes': case 'minute': case 'mins': case 'min': case 'minutely':
			schedule = '0 * * * * *';
			break;
		case 'hours': case 'hour': case 'hr': case 'hrs': case 'hourly':
			schedule = '0 55 * * * *';
			break;
		case 'hours2': case 'hour2': case 'hr2': case 'hrs2': case 'hourly2':
			schedule = '0 10 * * * *';
			break;
		case 'days': case 'day': case 'd': case 'ds': case 'daily': case 'dayly':
			schedule='0 0 9 * * *'; break;
		case 'weeks': case 'week': case 'wk': case 'wks': case 'weekly':
			schedule='30 4 * * 3 *'; break;
		case 'months': case 'month': case 'mo': case 'mos': case 'monthly':
			schedule='0 0 9 0 * *'; break;
	}
	// We have an error
	if(err){
	    console.log(err);
		return false;
	}
	// All good. Let's create the scheduled task. For this, we're using cron.js
	const job = new CronJob(schedule,method);
	job.start();
	// console.log(`Created task with schedule ${schedule}.`);
	return true;
}


const justTesting = async () => {
	// let test = await admin.grab_news_data_npr({});
	// console.log('test');
	// console.log(test);
}

// Testing stuff...
setTimeout(justTesting,1000);
createScheduledTasks();