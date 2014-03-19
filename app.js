/**
 * Module dependencies.
 */
var express = require('express'),
	http = require('http'),
	path = require('path'),
	colors = require('colors'),
	io = require('socket.io'),
	_ = require('underscore');


var app = express();

app.config = require('./lib/settings.js');
app.db = {};

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//io.set('log level', 1); // reduce logging
app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

/**
 * This App
 */
app.lang = require('./lang/lang.js').setLang(config.getLang());
app.autoupdater = require('auto-updater')({async:false,autoupdate:true});

	app.autoupdater.on('check-up-to-date',function(v){ console.log(app.lang.trans("autoupdater.check_up_to_date",v)); });
	app.autoupdater.on('check-out-dated',function(v_old , v){ console.log(app.lang.trans("autoupdater.check_out_dated",v_old,v)); });
	app.autoupdater.on('update-downloaded',function(){ console.log(app.lang.get("autoupdater.update_downloaded")); });
	app.autoupdater.on('update-not-installed',function(){ console.log(app.lang.get("autoupdater.update_not_installed")); });
	app.autoupdater.on('extracted',function(){ console.log(" > > ".bold.cyan + app.lang.get("autoupdater.extracted")); });
	app.autoupdater.on('download-start',function(name){ console.log(" > ".bold.cyan + app.lang.trans("autoupdater.download_start",name)); });
	app.autoupdater.on('download-update',function(name,perc){ process.stdout.write(" > ".bold.cyan + app.lang.trans("autoupdater.download_update",perc) + " \033[0G"); });
	app.autoupdater.on('download-end',function(name){ console.log(" > ".bold.cyan + app.lang.trans("autoupdater.download_end",name)); });
	app.autoupdater.on('download-error',function(err){ console.log((app.lang.get("autoupdater.download_error")).red); });

	app.autoupdater.forceCheck();

app.lib = require('./lib/library.js')(app);
app.users = require('./lib/users.js')(app);
app.player = require('./lib/player.js')(app);
app.playlist = require('./lib/playlist.js')(app);
app.music_tag = require('./lib/music_tag.js')(app);

app.socket = require('./lib/socketManager.js');
app.ip = require('./lib/localip.js');

app.users.init( app.socket.broadcastUsers , app.ip );

app.lib.init(function(){
	app.config.setLastAnalyze(_.now());
});

app.lib.load();
app.lib.onAnalyze(function(){
	app.player.stop();
	app.playlist.reset();
	app.socket.broadcastState({state:"analyze"});
});

app.playlist.init( app.socket.broadcastList , app.socket.broadcastCurrentSong , app.socket.broadcastState );
app.playlist.setForcePlay( app.player.play ); // POSIBLE ERROR

app.player.init( {autopilot:true} , app.socket.broadcastState );

app.playlist.setPlayer(app.player);

if ( app.music_tag.disabled() ) console.log(app.lang.get("error.warning").red + ": " + app.lang.get("require.musicmetadata"));

// ---------------------------
// Command line interpreter
app.command = require('./lib/commandInterpreter.js')(app);

// Exit handler
process.on('exit', function(code) {
	app.player.stop();
	app.config.save();
	app.socket.broadcastState({state:"off"}); // Broadcast exit
});

// Routes
require('./lib/routes.js')(app);

// Create Server con Socket
var server = http.createServer(app),
	io = io.listen(server, { log: false });

server.listen(app.get('port'), function(){
	console.log(app.lang.get("config.serverStarted").green + (app.ip[0]+':'+app.get('port')).grey);
	
	// Open in browser (win)
	if ( app.config.getDefOpen() )
		require('child_process').exec('start http://'+app.ip[0]+':'+app.get('port'));
});

// Socket.io
app.socket.init(io.sockets);