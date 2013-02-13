var mongoose = require('mongoose');
var topicjsDb = mongoose.connect('mongodb://localhost/topicjs');

var topicSchema = new mongoose.Schema({
	channel:String,
	topic:{
		c:String,
		m:String
	},
	createAt: { type: Date, default: Date.now }
});
var streamSchema = new mongoose.Schema({
	channel:    String,
	jusStream:  String,
	ustFMSUrl:  String,
	ustStream:  String,
	createAt:   { type: Date, default: Date.now }
});
var twiConfSchema = new mongoose.Schema({
	name:String,
	consumerKey:String,
	consumerSecret:String,
	accessTokenKey:String,
	accessTokenSecret:String,
	createAt: { type: Date, default: Date.now }
});
var streamLogSchema = new mongoose.Schema({
	nickname: String,
	username: String,
	userHost: String,
	createAt: { type: Date, default: Date.now }
});
var passwordSchema = new mongoose.Schema({
	type: String,
	password: String,
	createAt: { type: Date, default: Date.now }
});

exports.topic = topicjsDb.model('topic', topicSchema);
exports.stream = topicjsDb.model('stream', streamSchema);
exports.twiConf = topicjsDb.model('twiConf', twiConfSchema);
exports.streamLog = topicjsDb.model('streamLog', streamLogSchema);
exports.password = topicjsDb.model('password', passwordSchema);