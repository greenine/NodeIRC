var mongoose = require('mongoose');
var topicjsDb = mongoose.connect('mongodb://localhost/topicjs');

var topicSchema = new mongoose.Schema({
	channel:String,
	topic:{
		c:String,
		m:String
	},
	create_at: { type: Date, default: Date.now }
});
var streamSchema = new mongoose.Schema({
	channel:String,
	stream:String
});
var twiConfSchema = new mongoose.Schema({
	name:String,
	consumerKey:String,
	consumerSecret:String,
	accessTokenKey:String,
	accessTokenSecret:String
});
var streamLogSchema = new mongoose.Schema({
	channel:String,
	username:String,
	userIp:String,
	createAt: { type: Date, default: Date.now }
});
var userSchema = new mongoose.Schema({
	username:String,
	password:String,
	createAt: { type: Date, default: Date.now }
});

exports.topic = topicjsDb.model('topic', topicSchema);
exports.stream = topicjsDb.model('stream', streamSchema);
exports.twiConf = topicjsDb.model('twiConf', twiConfSchema);
exports.streamLog = topicjsDb.model('streamLog', streamLogSchema);
exports.user = topicjsDb.model('user', userSchema);