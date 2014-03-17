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

app.lib.addExclude(config.lib.excludes);
app.lib.addFolder(config.lib.folders);

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
var command = require('./lib/commandInterpreter.js')(app);

// Exit handler
process.on('exit', function(code) {
	//console.log('About to exit with code:', code);
	app.lib.save();
	app.player.stop();
	app.config.save();
	app.socket.broadcastState({state:"off"}); // Broadcast exit
});

// Views: diseño de la página.
app.get('/', function(req,res){
	res.render('index', {
		title: 'WeDJ',
		ip: app.ip[0]+':'+app.get('port'),
		admin: app.users.isAdmin(req.connection.remoteAddress),
		lang: app.lang.get("view"),
		langjs: JSON.stringify(app.lang.get("view.js"))
	})
});



// API
// Auth
app.get('/auth',function(req,res){
	if ( ! app.users.isLogged(req.connection.remoteAddress) )
		res.send('{"status":"error","type":1, "msj":"'+app.lang.get("api.notLogged")+'","admin":"'+app.users.isAdmin(req.connection.remoteAddress)+'"}');
	else {
		var usr = app.users.getUserfromIP(req.connection.remoteAddress);
		res.send('{"status":"ok","msj":"'+app.lang.get("api.logged")+'","id":'+usr.id+',"name":"'+usr.name+'","admin":"'+app.users.isAdmin(req.connection.remoteAddress)+'"}');
	}
		
});

app.post('/auth',function(req,res){
	if ( app.users.nameUsed(req.body.name) ) {
		res.send('{"status":"error","type":3, "msj":"'+app.lang.get("api.nameInUse")+'"}'); return;
	}
	var id = app.users.log(req.connection.remoteAddress,req.body.name);
	res.send('{"status":"ok", "msj":"'+app.lang.trans("api.loggedAs" , req.body.name)+'", "id":'+id+' , "admin":"'+app.users.isAdmin(req.connection.remoteAddress)+'"}');
});

app.get('/on',function(req,res){
	res.send('true');
});

// Chat
app.post('/chat', function(req, res){
	if ( ! app.users.isLogged(req.connection.remoteAddress) ) {
		res.send('{"status":"error", "type":1, "msj":"'+app.lang.get("api.notLogged")+'"}'); return;
	}
	res.send('{"status":"ok", "msj":"'+app.lang.get("api.msg_sent")+'"}');
	app.socket.broadcastChat({user:app.users.getName(req.connection.remoteAddress),msj:req.body.mensaje});
});

// Usuarios
app.get('/users', function(req, res){
	res.send(app.users.getUsers());
});

// Navegación
app.post('/api/nav', function(req, res){
	var ret = {music:app.lib.navSongs(req.body.folder),folders:null};
	if ( req.body.dirs == 'on' ) ret.folders = app.lib.navFolder(req.body.folder);
	res.send(JSON.stringify(ret));
});

// Next
app.get('/api/votenext', function(req, res){
	if ( ! app.users.isLogged(req.connection.remoteAddress) ) {
		res.send('{"status":"error", "type":1, "msj":"'+app.lang.get("api.notLogged")+'"}'); return;
	}
	app.playlist.voteNext( app.users.getID(req.connection.remoteAddress) );

	res.send('{"status":"ok", "msj":"'+app.lang.get("api.voteSent")+'"}');
});

// Admin
app.post('/api/admin', function(req, res){
	if ( ! app.users.isAdmin(req.connection.remoteAddress) ) {
		res.send('{"status":"error", "type":0, "msj":"'+app.lang.get("api.adminAuth")+'"}');
		return;
	}

	res.send(JSON.stringify({status:"ok", msj: command(req.body.accion,req.body.val,true)} ) );
});

// Playlist
app.get('/api/queue/:id', function(req, res){
	if ( ! app.users.isLogged(req.connection.remoteAddress) ) {
		res.send('{"status":"error", "type":1, "msj":"' + app.lang.get("api.notLogged")+'"}'); return;
	}
	if ( app.playlist.isSong(req.params.id) ) {
		res.send('{"status":"error", "type":2, "msj":"' + app.lang.get("api.songAlready")+'"}'); return;
	}
	app.playlist.addSong ( app.lib.files[req.params.id] , app.users.getID(req.connection.remoteAddress ) );
	res.send('{"status":"ok","msj":"' + app.lang.get("api.songAdded") + '"}');

});

app.get('/api/playlist', function(req, res){
	res.send(app.playlist.songs);
});
app.get('/api/current', function(req, res){
	currentSong = app.playlist.current;
	if ( currentSong == null ) currentSong = {};
	res.send({listening:currentSong,status:app.player.state});
});

// Create Server con Socket
var server = http.createServer(app),
	io = io.listen(server, { log: false });

server.listen(app.get('port'), function(){
	console.log(app.lang.get("config.serverStarted").green + (app.ip[0]+':'+app.get('port')).grey);
});

// Socket.io
app.socket.init(io.sockets);
/*io.sockets.on('connection',function(sock){
	sock.emit('',{});
});*/

/*
*	TO-DO List:
*
*		Smart playlist (orden de usuario, orden de votos)
*		ID3 !!!
*
*/