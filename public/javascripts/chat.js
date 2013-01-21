$(function() {
	var socket = io.connect('http://greenine.c.node-ninja.com');
	socket.on('connect', function() {
		console.log('connected');
	});
	
	$('#btn').click(function() {
		var message = $('#message');
		console.log(message);
		socket.emit('msg send', message.val());
	});
	
	socket.on('msg push', function (msg) {
		console.log(msg);
		var date = new Date();
		msgArr = msg.split(':');
		msgChannel = msgArr[0];
		msgArr.splice(0,1);
		msgBody = msgArr.join('');
		$(msgChannel).text(msgBody);
	});
	
	socket.on('msg updateDB', function(msg){
		console.log(msg);
	});
});