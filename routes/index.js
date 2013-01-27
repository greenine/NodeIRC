/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};

exports.minolisChTop = function(req, res){
    res.render('minolisChTop', {
        title:      'minolisChTop',
        showCnt:    6,
        jusIds:     new Array('minolis00001111', 'minolis222', 'minolis333', 'minolis444', 'minolis5555', 'minolis666'),
        ustIds:     new Array('10149531', '10149544', '10149555', '10142588', '10149576', '10149592'),
        chatIds:    new Array('mnr-chat1', 'mnr-chat2', 'mnr-chat3', 'mnr-chat4', 'mnr-chat5', 'mnr-chat6'),
    });
};

exports.manage = function(req, res){
	res.render('manage', {
        title: 'manage Page',
    });
};

exports.setDb = function(req, res){
    var models = require('../models');
    
    if(req.query.table == 'twiConf'){
        var twiConfTable = models.twiConf;
        var newTwiConf = new twiConfTable();
        newTwiConf.name = req.query.name;
        newTwiConf.consumerKey = req.query.consumerKey;
        newTwiConf.consumerSecret = req.query.consumerSecret;
        newTwiConf.accessTokenKey = req.query.accessTokenKey;
        newTwiConf.accessTokenSecret = req.query.accessTokenSecret;
        newTwiConf.save(function(err){
            
        });
    } else if( req.query.table == 'twiConf' ) {
        var streamTable = models.stream;
        var newStream = new streamTable();
        newStream.channel = req.query.channel;
        newStream.stream = req.query.stream;
    } else {
        console.log('unknown table');
    }
    res.render('index', { title: 'Result' });
};