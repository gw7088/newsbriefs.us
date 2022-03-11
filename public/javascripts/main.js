var socket = io();

socket
	.on('canary', function (data) {
		$('.running_for').html('Server running for:<br>' + secondsToDhms(data.duration));
	})
	.on('error', function (data) {
		console.log('socket event state: error');
		console.log(data);
	})
	.on('connection', function (data) {
		console.log('socket event state: connection');
		console.log(data);
	})
	.on('disconnect', function (data) {
		console.log('socket event state: disconnect');
		console.log(data);
	})
	.on('connect', function (data) {
		console.log('socket event state: connect');
		console.log(data);
	})
	.on('reconnect', function (data) {
		console.log('socket event state: reconnect');
		console.log(data);
	})
	.on('connect_failed', function (data) {
		console.log('socket event state: connect_failed');
		console.log(data);
	})
	.on('connect_error', function (data) {
		console.log('socket event state: connect_error');
		console.log(data);
	})
	.on('connect_timeout', function (data) {
		console.log('socket event state: connect_timeout');
		console.log(data);
	})
	;


function showToastAlert(message,_timeout,color,background){
	if(typeof color=='undefined') color = '#FFFFFF';
	if(typeof background=='undefined') background = '#7fb8ff';
	if(typeof title=='undefined') title = '';
	var timeout = typeof _timeout=='undefined'?5:_timeout;
	iziToast.show({
		title: title?title:'',
		message: message?message:'--',
		closeOnEscape: true,
		titleColor: color,
		messageColor: color,
		backgroundColor: background,
		position: window.taPos ? window.taPos : 'bottomCenter',
		// timeout: timeout,
		drag: false,
	});
}
function showToastError(msg,title){
	iziToast.show({
		title: title?title:'Uh Oh!',
		message: msg?msg:'--',
		closeOnEscape: true,
		titleColor: '#FFFFFF',
		messageColor: '#FFFFFF',
		backgroundColor: '#FF4433',
		position: 'bottomCenter',
		// timeout: timeout,
		drag: false,
	});
}
	