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

app.config = require('./lib/Settings.js');
app.db = {};

// All environments
app.set('port', process.env.PORT || app.config.settings.getPort());

app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

/**
 * This App
 */
app.lang = require('./lang/lang.js').setLang(app.config.settings.getLang());

// Loads App AutoUpdater
app.autoupdater = require('./lib/autoupdater.js')(app);

app.lib = require('./lib/Library.js')(app);
app.users = require('./lib/users/Users.js')(app);
app.player = require('./lib/player/Player.js')(app);
app.playlist = require('./lib/Playlist.js')(app);
app.music_tag = require('./lib/MusicTag.js')(app);

app.socket = require('./lib/SocketManager.js');
app.ip = require('./lib/localip.js');

/**
 * Initiates the users
 */
app.users.init(app.socket.broadcastUsers, app.ip);

/**
 * Initiates the library
 */

app.lib.load(true, function(r) {
	if (r) console.log(app.lang.get("lib.libsLoaded"));
});

app.lib.onAnalyze(function() {
	app.player.stop();
	app.playlist.reset();
	app.socket.broadcastState({
		state: "analyze"
	});
	app.config.lib.setLastAnalyze();
	console.log("Analizado correctamente");
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
app.command = require('./lib/CommandInterpreter.js')(app);

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
require('./lib/Routes.js')(app);

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
	if (app.config.settings.getDefOpen())
		require('child_process').exec('start http://' + app.ip[0] + ':' + app.get('port'));
});

/**
 * Initiates the Sockets
 */
app.socket.init(io.sockets);