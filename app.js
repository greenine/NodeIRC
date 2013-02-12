/**
 * Module dependencies.
 */
// import libs
var express	= require('express'),
    routes	= require('./routes'),
    http	= require('http'),
    path	= require('path'),
    twitter	= require('ntwitter'),
    http	= require('http'),
    irc     = require('irc'),
    models	= require('./models');
  
// load models	
var topicTable      = models.topic,
    streamTable     = models.stream,
    twiConfTable    = models.twiConf,
    streamLogTable  = models.streamLog,
    passwordTable   = models.password;

//変数定義
var app = express();
var M_Checker = null;
var twiConf = twiConfTable.findOne({name:'M_Checker_Dev'},
    function(err,params){
        if( params != null ){
            console.log('make twitter client');
            M_Checker = new twitter({
                consumer_key: params.consumerKey,
                consumer_secret: params.consumerSecret,
                access_token_key: params.accessTokenKey,
                access_token_secret: params.accessTokenSecret
            });
        } else {
            console.log('not registor twitter config');
        }
    }
);

var channelTable = {
    '#mnrl1': 'Jus1',
    '#mnrl2': 'Jus2',
    '#mnrl3': 'Jus3',
    '#mnrl4': 'Jus4',
    '#mnrl5': 'Jus5',
    '#mnrl6': 'Jus6',
};

var joinChannelList = new Array();
//channelTableに設定されたチャンネルにBotが入る
for( var ch in channelTable ){
    joinChannelList.push(ch);
}

var chanDataList    = new Array();
var streamPassRow   = "";
var streamList      = new Array();

/* topic用変数 */
var tTopic = new Array(),
    mTopic = new Array(),
    cTopic = '';

topicTable.find({},
    function(err, rows){
        if( err ) console.log(err);
        for( var i=0; i<rows.length; i++ ){
            //console.log(rows[i]["channel"]);
            mTopic[rows[i]["channel"]] = rows[i]["topic"]["m"];
            cTopic = rows[i]["topic"]["c"];
        }
    }
);

/* irc bot */
var botId = 'mebius29';
var topicBot = new irc.Client(
    'chat1.ustream.tv',
    botId,
    {
        debug: false,
        userName: 'nodebot',
        realName: 'nodeJS IRC client',
        channels: joinChannelList
    }
);

/**
 * stream表示の状態保存用変数
 * null || undefined || 0 : 最初の対応
 * 10 : usernameとpassword問い合わせ中
 * 20 : ログ保存問い合わせ
 * 30 : ログ保存の問い合わせ回答による対処
 */
var streamStatus = new Array();

app.configure(function(){
    app.set('port', process.env.PORT || 1192);
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
app.get('/minolisChTop', routes.minolisChTop);
app.get('/manage', routes.manage);
app.get("/logs", routes.logs);

app.post('/setDb', routes.setDb);

var server = http.createServer(app).listen(app.get('port'),
    function(){
        console.log("Express server listening on port " + app.get('port'));
    }
);

topicBot.addListener('raw', function (params) {
    switch(params.command){
        case 'PRIVMSG':
            //params.args[0] : channel or username
            //params.args[1] : message
            if( params.args[0] === botId ){
                //トークの場合
                if( typeof(streamStatus[params.nick]) === 'undefined' || streamStatus[params.nick] === 0 ){
                    //strem問い合わせ状態でないとき
                    if( params.args[1] === "stream" ){
                        //stream問い合わせ状態への移行
                        //最新のstreamListを取得する
                        passwordTable.findOne(
                            { type: "stream" },
                            function(err, row){
                                //console.log("Error : "+err);
                                streamPassRow = row;
                            }
                        );
                        if( typeof streamPassRow === "undefine" || streamPassRow === null ){
                            topicBot.say( params.nick, "passwordが設定されていません。管理者に問い合わせてください。" );
                        } else {
                            //Botを問い合わせ状態にする
                            streamStatus[params.nick] = 10;
                            topicBot.say(params.nick, 'stream問い合わせを開始します。passwordを入力してください');
                        }
                    } else {
                    }
                } else{
                    //stream問い合わせ中
                    if( 10 <= streamStatus[params.nick] && streamStatus[params.nick] < 12 ){
                        //password問い合わせ
                        //３回まで問い合わせできる
                        streamStatus[params.nick]++;
                        topicBot.say(params.nick, '入力したpassword : ' + params.args[1]);
                        //mongoDBを使ってパスワード一致するか
                        if( params.args[1] === unescape(streamPassRow["password"]) ){
                            streamStatus[params.nick] = 20;
                        } else {
                            topicBot.say(params.nick, "passwordが違います。もう一度入力してください。");
                        }
                    } else if( 12 <= streamStatus[params.nick] && streamStatus[params.nick] < 20 ){
                        //password3回以上間違えたのでstatusを0に戻す
                        streamStatus[params.nick] = 0;
                        topicBot.say(params.nick, '入力ミス上限回数を超えました。passwordを確認してからもう一度問い合わせてください。');
                    }
                    if( streamStatus[params.nick] === 20 ){
                        //ログを取る旨を確認する
                        topicBot.say(params.nick, 'stream表示するにはlogとして以下の内容を保存しますがよろしいですか？');
                        //nickname, username, ip, createAtを表示
                        topicBot.say(params.nick, 'nickname : ' + params.nick);
                        topicBot.say(params.nick, 'username : ' + params.user);
                        topicBot.say(params.nick, 'host : ' + params.host);
                        topicBot.say(params.nick, 'okの場合はyes, ダメな場合はそれ以外の文字を入力してください');
                        streamStatus[params.nick] = 30;
                    } else if( streamStatus[params.nick] === 30 ){
                        //yes or else
                        if( params.args[1].match(/^[yｙ][eｅ][sｓ]/i) ){
                            //ログ保存処理
                            var streamLog = new streamLogTable();
                            streamLog.nickname = params.nick;
                            streamLog.username = params.user;
                            streamLog.userHost = params.host;
                            streamLog.save(
                                function(err){
                                    console.log(err);
                                }
                            );
                            //最新のstream情報を取得
                            streamTable.find({},
                                function(err, rows){
                                    if( err ){
                                        topicBot.say( params.nick, "streamの取得に失敗しました" );
                                    } else {
                                        for( var i=0; i<rows.length; i++ ){
                                            topicBot.say( params.nick, "-------------------------------" );
                                            topicBot.say( params.nick, "channel: "+rows[i]["channel"] );
                                            topicBot.say( params.nick, "jusFMSUrl: "+rows[i]["jusFMSUrl"] );
                                            topicBot.say( params.nick, "jusStream: "+rows[i]["jusStream"] );
                                            topicBot.say( params.nick, "jusAddress: "+rows[i]["jusAddress"] );
                                            topicBot.say( params.nick, "ustFMSUrl: "+rows[i]["ustFMSUrl"] );
                                            topicBot.say( params.nick, "ustStream: "+rows[i]["ustStream"] );
                                            topicBot.say( params.nick, "ustAddress: "+rows[i]["ustAddress"] );
                                        }
                                        topicBot.say( params.nick, "表示完了" );
                                    }
                                    
                                }
                            );
                            streamList = new Array();
                        } else{
                            //キャンセル
                            topicBot.say(params.nick, 'キャンセルされました');
                        }
                        //とりあえず初期化する
                        streamStatus[params.nick] = 0;
                    }
                }
                //topicBot.say(params.nick, 'トークを受け取りました');
                //console.log(params);
            } else {
                //通常発言
                if(params.args[1].match(/^[#＃][tｔmｍcｃ][:> ：＞　]/i)){
                    if(topicBot.chans[params.args[0]].users[botId].match(/@/)){
                        if(params.args[1].match(/^[#＃][tｔ][:> ：＞　]/i)) {
                            //#tに対する処理
                            if(RegExp.rightContext != ''){
                                tTopic[params.args[0]] = RegExp.rightContext + ' ';
                            }
                            else{
                                tTopic[params.args[0]] = RegExp.rightContext;
                            }
                            if(mTopic[params.args[0]] == null){
                                mTopic[params.args[0]] ='';
                            }
                            topicBot.send('TOPIC', params.args[0], tTopic[params.args[0]] + mTopic[params.args[0]] + cTopic);
                        } else if(params.args[1].match(/^[#＃][mｍ][:> ：＞　]/i)) {
                            //#mに対する処理
                            if(RegExp.rightContext != ''){
                                mTopic[params.args[0]] = RegExp.rightContext + ' ';
                            }
                            else{
                                mTopic[params.args[0]] = RegExp.rightContext;
                            }
                            if(tTopic[params.args[0]] == null){
                                tTopic[params.args[0]] ='';
                            }
                            topicBot.send('TOPIC', params.args[0], tTopic[params.args[0]]+ mTopic[params.args[0]] + cTopic);
                            //DBに保存する
                            topicTable.findOne(
                                { channel: params.args[0] },
                                function(err, row){
                                    if( err ) console.log();
                                    if( row ){
                                        topicTable.update(
                                            { channel: params.args[0] },
                                            { $set:
                                                {
                                                    topic: {
                                                        m: mTopic[params.args[0]],
                                                        c: cTopic
                                                    }
                                                }
                                            },
                                            function(err){ console.log(err); }
                                        );
                                    } else {
                                        var newTopic = new topicTable();
                                        newTopic.channel = params.args[0];
                                        newTopic.topic.m = mTopic[params.args[0]];
                                        newTopic.topic.c = cTopic;
                                        newTopic.save();
                                    }
                                }
                            );
                            
                        }else if(params.args[1].match(/^[#＃][cｃ][:> ：＞　]/i)){
                            //#cに対する処理
                            cTopic = RegExp.rightContext;
                            if(tTopic[params.args[0]] == null){ tTopic[params.args[0]] =''; }
                            if(mTopic[params.args[0]] == null){ mTopic[params.args[0]] =''; }
                            topicBot.send('TOPIC', params.args[0], tTopic[params.args[0]] + mTopic[params.args[0]] + cTopic);
                            //DBに保存する処理
                            topicTable.findOne(
                                { channel: params.args[0] },
                                function(err, row){
                                    if( err ) console.log(err);
                                    if( row ){
                                        topicTable.update(
                                            { channel: params.args[0] },
                                            { $set:
                                                {
                                                    topic: {
                                                        m: mTopic[params.args[0]],
                                                        c: cTopic
                                                    }
                                                }
                                            },
                                            function(err){ console.log(err); }
                                        );
                                    } else {
                                        var newTopic = new topicTable();
                                        newTopic.channel = params.args[0];
                                        newTopic.topic.m = mTopic[params.args[0]];
                                        newTopic.topic.c = cTopic;
                                        newTopic.save();
                                    }
                                }
                            );
                        }
                    }else{
                        topicBot.say(params.args[0], 'このコマンドの実行にはオペレータ権限が必要です');
                    }
                }
            }
            //console.log(topicBot.chans[params.args[0]].users[botId]);
            //console.log(params);
            break;
        case 'TOPIC':
            //Topicをツイート
            if(M_Checker != null){
                var date = new Date();
                if((hh = date.getHours()) < 10){ hh = "0" + hh; }
                if((mm = date.getMinutes()) < 10){ mm = "0" + mm; }
                if( typeof channelTable[params.args[0]]  !== 'undefined'){
                    M_Checker.post(
                        "http://api.twitter.com/1/statuses/update.json",
                        {status: "["+channelTable[params.args[0]]+" Topic] "+params.args[1]+" ("+hh+":"+mm+")"},
                        function(error, data){ /*console.log(data.text);*/ }
                    );
                    http.get({
                            host: 'www42.atpages.jp',
                            port: 80,
                            path: "/minolis2nd/M_Checker_Topic/setTopic.cgi?ch="+(params.args[0]).slice(1) + "&tp=" + encodeURIComponent(params.args[1])
                        },
                        function(res){
                            //console.log('res.statusCode='+res.statusCode);
                        }
                    ).on('error', function(e){
                        console.log('error message:'+e.message);
                    });
                }
            }
            break;
        default:
            //console.log(params);
            break;
        }
});

topicBot.addListener("error",function(params){
    switch(params.rawCommand){
        case '482':
            //params.args[0] : nick
            //params.args[1] : channel
            //params.args[2] : message
            topicBot.say(params.args[1], 'このコマンドの実行にはオペレーター権限が必要です！');
            break;
    }
    console.log(params);
});

/* socket.io */
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    chanDataList = topicBot.chans;
    for(var channel in chanDataList){
        socket.emit('msg push', channel+':'+chanDataList[channel].topic);
    }
    topicBot.addListener("raw", function (params) {
        switch(params.command){
            case 'TOPIC':
                //params.args[0] : channel
                //params.args[1] : topic
                //Topicを表示する
                if( typeof params.args[1] !== undefined ){
                    socket.emit('msg push', params.args[0]+':'+params.args[1]);
                } else {
                    socket.emit('msg push', params.args[0]+': ');
                }
                break;
        }
    });
});