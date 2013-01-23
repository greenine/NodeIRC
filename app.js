/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , twitter = require('ntwitter')
  , http = require('http')
  , irc = require('irc');

//M_Checker_Dev
var M_Checker = new twitter({
	consumer_key: '',
	consumer_secret: '',
	access_token_key: '',
	access_token_secret: ''
});

var channelTable = {
	'#mnr-chat1': 'Jus1',
	'#mnr-chat2': 'Jus2',
	'#mnr-chat3': 'Jus3',
	'#mnr-chat4': 'Jus4',
	'#mnr-chat5': 'Jus5',
	'#mnr-chat6': 'Jus6',
	'#meteornaka': 'meteornaka'
};

var topicBot = new irc.Client('chat1.ustream.tv', ustreamId,{
    debug: false,
    channels: ['#mnr-chat1','#mnr-chat2','#mnr-chat3','#mnr-chat4','#mnr-chat5','#mnr-chat6','#meteornaka','#aot29'],
});

var app = express();
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
topicBot.addListener('raw', function (params) {
	switch(params.command){
		case 'TOPIC':
			//params.args[0] : channel
			//params.args[1] : topic
			//Topicを表示する
			topics[params.args[0]] = params.args[0]+':'+params.args[1];
			socket.emit('msg push', topics[params.args[0]]);
			//Topicをツイート
			var date = new Date()
			if((hh = date.getHours()) < 10){ hh = "0" + hh; }
			if((mm = date.getMinutes()) < 10){ mm = "0" + mm; }
			if( typeof(channelTable[params.args[0]])  != 'undefined'){
				M_Checker.post(
					"http://api.twitter.com/1/statuses/update.json",
					{status: "["+channelTable[params.args[0]]+" Topic] "+params.args[1]+" ("+hh+":"+mm+")"},
					function(error, data){
						console.log(data.text);
					}
				);
				http.get({
						host: 'www42.atpages.jp',
						port: 80,
						path: "/minolis2nd/M_Checker_Topic/setTopic.cgi?ch="+(params.args[0]).slice(1) + "&tp=" + encodeURIComponent(params.args[1])
					},
					function(res){
						console.log('res.statusCode='+res.statusCode);
					}
				).on('error', function(e){
					console.log('error message:'+e.message);
				});
			}
			
			break;
		case 'rpl_topic':
			//params.args[0] : username
			//params.args[1] : channel
			//params.args[2] : topic
			topics[params.args[1]] = params.args[1]+':'+params.args[2];
			break;
		case 'PRIVMSG':
			//params.args[0] : channel
			//params.args[1] : message
			//topicBot.say('何か');	//ボットの発言
			break;
		default:
			//console.log(params);
			break;
	}
});

/* socket.io */
var io = require('socket.io').listen(server)
io.sockets.on('connection', function (socket) {
	for(var key in topics){
		socket.emit('msg push', topics[key]);
	}
});