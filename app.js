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
    irc         = require('irc'),
    models	= require('./models');
  
// load models	
var topicTable      = models.topic,
    streamTable     = models.stream,
    twiConfTable    = models.twiConf,
    streamLogTable  = models.streamLog,
    userTable       = models.user;

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
    '#mnr-chat1': 'Jus1',
    '#mnr-chat2': 'Jus2',
    '#mnr-chat3': 'Jus3',
    '#mnr-chat4': 'Jus4',
    '#mnr-chat5': 'Jus5',
    '#mnr-chat6': 'Jus6',
    '#meteornaka': 'meteornaka',
    '#aot29': 'aot29'
};

var chanDataList = [];

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
app.post('/setDb', routes.setDb);

var server = http.createServer(app).listen(app.get('port'),
    function(){
        console.log("Express server listening on port " + app.get('port'));
    }
);

/* irc bot */
var ustreamId = 'mebius29';
var topicBot = new irc.Client('chat1.ustream.tv', ustreamId,{
    debug: false,
    userName: 'nodebot',
    realName: 'nodeJS IRC client',
    channels: ['#meteornaka','#aot29']
});

var tTopic = new Array(),
    mTopic = new Array(),
    cTopic = '';

topicBot.addListener('raw', function (params) {
    switch(params.command){
        case 'PRIVMSG':
            //params.args[0] : channel or username
            //params.args[1] : message
            if( params.args[0] === 'mebius29' ){
                //トークの場合
                //stream表示コマンド受け取り
                if( params.args[1].match(/^[#＃][sｓ][:> ：＞　]/i) ){
                    //#sでストリーム表示受付
                    //usernameとpasswordを聞く
                    //mongoDBに問い合わせ正しくなかったら拒否する？or３回聞きなおす
                    //OKならログ内容と取ることを確認
                    //ログ確認OK出たらstreamをトークで送信する
                    //ログ確認拒否なら表示しない
                    //ダメなら棄却
                }
                topicBot.say(params.nick, 'トークを受け取りました');
            } else {
                //通常発言
                if(params.args[1].match(/^[#＃][tｔmｍcｃ][:> ：＞　]/i)){
                    if(topicBot.chans[params.args[0]].users[ustreamId].match(/@/)){
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
                            //mongoDBのtopicテーブルを更新する
                            var topicRow = new topicTable();
                            var topicDataList = {
                                topic: {
                                    m: mTopic[params.args[0]],
                                    c: cTopic
                                }
                            };
                            topicRow.update(
                                { channel: params.args[0] },
                                { $set: topicDataList },
                                { upsert: TRUE },
                                function(err){ if(err){ return; } }
                            );
                            
                        }else if(params.args[1].match(/^[#＃][cｃ][:> ：＞　]/i)){
                            //#cに対する処理
                            cTopic = RegExp.rightContext;
                            if(tTopic[params.args[0]] == null){ tTopic[params.args[0]] =''; }
                            if(mTopic[params.args[0]] == null){ mTopic[params.args[0]] =''; }
                            topicBot.send('TOPIC', params.args[0], tTopic[params.args[0]] + mTopic[params.args[0]] + cTopic);
                            //mongoDBに保存する処理
                            var topicRow = new topicTable();
                            var topicDataList = {
                                topic: {
                                    m: mTopic[params.args[0]],
                                    c: cTopic
                                }
                            };
                            topicRow.update(
                                { channel: params.args[0] },
                                { $set: topicDataList },
                                { upsert: TRUE },
                                function(err){ if(err){ return; } }
                            );
                        }
                    }else{
                        topicBot.say(params.args[0], 'このコマンドの実行にはオペレータ権限が必要です');
                    }
                }
            }
            //console.log(topicBot.chans[params.args[0]].users[ustreamId]);
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
                            console.log('res.statusCode='+res.statusCode);
                        }
                    ).on('error', function(e){
                        console.log('error message:'+e.message);
                    });
                }
            }
            break;
        case 'MODE':
            //console.log(params);
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