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

exports.logs = function(req, res){
    var models = require("../models");
    var streamLogTable = models.streamLog;
    var streamLogList = new Array();

    streamLogTable.find({},
        function(err, logs){
            if(err){
                console.log(err);
                res.render( "logs", {
                    title: "Log",
                    logs: []
                } );
                return;
            } else {
                res.render( "logs", {
                    title: "Log",
                    logs: logs
                } );
            }
            
        }
    );
};

exports.setDb = function(req, res){
    var models = require('../models');
    var registParamList = new Array();
    var reqParams = new Array();
    for( reqBodyKey in req.body ){
        reqParams[reqBodyKey] = req.body[reqBodyKey];
    }
    //var reqParams = escape(req.body);
    if(reqParams.table == 'twiConf'){
        var twiConfTable = models.twiConf;
        var newTwiConf = new twiConfTable();

        registParamList = {
            consumerKey: reqParams.consumerKey,
            consumerSecret: reqParams.consumerSecret,
            accessTokenKey: reqParams.accessTokenKey,
            accessTokenSecret: reqParams.accessTokenSecret
        };

        twiConfTable.findOne(
            { name: reqParams.name },
            function( err, row ){
                
                if( err ) console.log( err );
                if( row ){
                    console.log("row found!");
                    twiConfTable.update(
                        { name: reqParams.name },
                        { $set: registParamList },
                        function(err){ console.log(err); }
                    );
                } else {
                    console.log("row not found");
                    newTwiConf.name = reqParams.name;
                    newTwiConf.consumerKey = reqParams.consumerKey;
                    newTwiConf.consumerSecret = reqParams.consumerSecret;
                    newTwiConf.accessTokenKey = reqParams.accessTokenKey;
                    newTwiConf.accessTokenSecret = reqParams.accessTokenSecret;
                    newTwiConf.save();
                }
            }
        );

        res.render('registResult',
            {
                title: 'Twitter Config Regist Complete',
                registTable: reqParams.table,
                registKey: reqParams.name,
                registParams: registParamList
            }
        );
    } else if( reqParams.table == 'stream' ) {
        var streamTable = models.stream;
        var newStream = new streamTable();

        registParamList = {
            jusFMSUrl: reqParams.jusFMSUrl,
            jusStream: reqParams.jusStream,
            jusAddress: reqParams.jusAddress,
            ustFMSUrl: reqParams.ustFMSUrl,
            ustStream: reqParams.ustStream,
            ustAddress: reqParams.ustAddress
        };

        streamTable.findOne(
            { channel: reqParams.channel },
            function( err, row ){
                
                if( err ) console.log( err );
                if( row ){
                    console.log("row found!");
                    streamTable.update(
                        { channel: reqParams.channel },
                        { $set: registParamList },
                        function(err){ console.log(err); }
                    );
                } else {
                    console.log("row not found");
                    newStream.channel = reqParams.channel;
                    newStream.jusFMSUrl = reqParams.jusFMSUrl;
                    newStream.jusStream = reqParams.jusStream;
                    newStream.jusAddress = reqParams.jusAddress;
                    newStream.ustFMSUrl = reqParams.ustFMSUrl;
                    newStream.ustStream = reqParams.ustStream;
                    newStream.ustAddress = reqParams.ustAddress;
                    newStream.save();
                }
            }
        );
        
        res.render('registResult',
            {
                title: 'Stream Regist Complete',
                registTable: reqParams.table,
                registKey: reqParams.channel,
                registParams: registParamList
            }
        );
    } else if( reqParams.table == "password" ){
        var passwordTable = models.password;
        var newPassword = new passwordTable();

        registParamList = {
            password: reqParams.password
        };

        passwordTable.findOne(
            { type: reqParams.type },
            function( err, row ){
                
                if( err ) console.log( err );
                if( row ){
                    console.log("row found!");
                    passwordTable.update(
                        { type: reqParams.type },
                        { $set: registParamList },
                        function(err){ console.log(err); }
                    );
                } else {
                    console.log("row not found");
                    newPassword.type = reqParams.type;
                    newPassword.password = reqParams.password;
                    newPassword.save();
                }
            }
        );

        res.render('registResult',
            {
                title: 'Password Regist Complete',
                registTable: reqParams.table,
                registKey: reqParams.type,
                registParams: registParamList
            }
        );
    } else {
        console.log('unknown table');
        res.render('registResult', { title: 'Error' } );
    }
};