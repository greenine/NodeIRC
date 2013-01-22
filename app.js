
/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');
 
var topics = [];

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/topicViewer', routes.topicViewer);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

/* irc bot */
var irc = require('irc');
var ustreamId = Math.floor( Math.random()*899999 ) + 100000;
ustreamId = 'ustreamer-' + ustreamId;

var topicBot = new irc.Client('chat1.ustream.tv', ustreamId,{
    debug: true,
    channels: ['#meteornaka','#aot29'],
});

/* socket.io */
var io = require('socket.io').listen(server)
io.sockets.on('connection', function (socket) {
	topicBot.addListener('raw', function (params) {
		switch(params.command){
			case 'TOPIC':
				//params.args[0] : channel
				//params.args[1] : topic
				topics[params.args[0]] = params.args[0]+':'+params.args[1];
				socket.emit('msg push', topics[params.args[0]]);
				break;
			case 'rpl_topic':
				//params.args[0] : username
				//params.args[1] : channel
				//params.args[2] : topic
				topics[params.args[1]] = params.args[1]+':'+params.args[2];
				break;
			default:
				//console.log(params);
				break;
		}
	});
	for(var key in topics){
		socket.emit('msg push', topics[key]);
	}
});