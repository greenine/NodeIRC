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
	res.render('manage',
        {
            title: 'manage Page'
        }
    );
};

exports.setDb = function(req, res){
    var models = require('../models');
    var registParamList = new Array();
    if(req.body.table == 'twiConf'){
        var twiConfTable = models.twiConf;
        var newTwiConf = new twiConfTable();
        registParamList = {
            consumerKey: req.body.consumerKey,
            consumerSecret: req.body.consumerSecret,
            accessTokenKey: req.body.accessTokenKey,
            accessTokenSecret: req.body.accessTokenSecret
        };
        newTwiConf.update(
            { name: req.body.name },
            { $set: registParamList },
            { upsert: TRUE },
            function(err){ console.log(err); }
        );
        res.render('registResult',
            {
                title: 'Twitter Config Regist Complete',
                registTable: req.body.table,
                registParams: registParamList
            }
        );
    } else if( req.body.table == 'stream' ) {
        var streamTable = models.stream;
        var newStream = new streamTable();
        registParamList = {
            stream: req.body.stream
        }
        newStream.update(
            { channel: req.body.channel },
            { $set: registParamList },
            { upsert: TRUE },
            function(err){ console.log(err); }
        );
        res.render('registResult',
            {
                title: 'Stream Regist Complete',
                registTable: req.body.table,
                registParams: registParamList
            }
        );
    } else {
        console.log('unknown table');
    }
    res.render('registParams', { title: 'Error' } );
};