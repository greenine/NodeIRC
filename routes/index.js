/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.topicViewer = function(req, res){
  res.render('topicViewer', { title: 'topicViewer' });
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