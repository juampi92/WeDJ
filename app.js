/**
 * Module dependencies.
 */
var express = require('express'),
	http = require('http'),
	path = require('path'),
	colors = require('colors'),
	io = require('socket.io'),
	_ = require('underscore');

/**
 * App
 * @type {Object}
 */
var app = express();

app.config = require('./lib/settings.js');
app.db = {};

// All environments
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

// Loads App AutoUpdater
app.autoupdater = require('./lib/autoupdater.js')(app);

app.lib = require('./lib/library.js')(app);
app.users = require('./lib/users.js')(app);
app.player = require('./lib/player.js')(app);
app.playlist = require('./lib/playlist.js')(app);
app.music_tag = require('./lib/music_tag.js')(app);

app.socket = require('./lib/socketManager.js');
app.ip = require('./lib/localip.js');

/**
 * Initiates the users
 */
app.users.init(app.socket.broadcastUsers, app.ip);

/**
 * Initiates the library
 */
app.lib.init(function() {
	app.config.setLastAnalyze(_.now());
});

app.lib.load();
app.lib.onAnalyze(function() {
	app.player.stop();
	app.playlist.reset();
	app.socket.broadcastState({
		state: "analyze"
	});
});

/**
 * Initiates the Playlist
 */
app.playlist.init(app.socket.broadcastList, app.socket.broadcastCurrentSong, app.socket.broadcastState);
app.playlist.setForcePlay(app.player.play); // POSIBLE ERROR


/**
 * Initiates the Player
 */
app.player.init({
	autopilot: true
}, app.socket.broadcastState);

app.playlist.setPlayer(app.player);

// TMP
if (app.music_tag.disabled()) console.log(app.lang.get("error.warning").red + ": " + app.lang.get("require.musicmetadata"));

/**
 * Loads the Command Line Interpreter
 */
app.command = require('./lib/commandInterpreter.js')(app);

/**
 * Handler
 * 	Handles the exit of the program
 */
process.on('exit', function(code) {
	app.player.stop();
	app.config.save();
	app.socket.broadcastState({
		state: "off"
	}); // Broadcast exit
});

/**
 * Router
 * 	Manage routes
 */
require('./lib/routes.js')(app);

/**
 * Initiates the server
 */
var server = http.createServer(app),
	io = io.listen(server, {
		log: false
	});

server.listen(app.get('port'), function() {
	console.log(app.lang.get("config.serverStarted").green + (app.ip[0] + ':' + app.get('port')).grey);

	// Open in browser (win)
	if (app.config.getDefOpen())
		require('child_process').exec('start http://' + app.ip[0] + ':' + app.get('port'));
});

/**
 * Initiates the Sockets
 */
app.socket.init(io.sockets);