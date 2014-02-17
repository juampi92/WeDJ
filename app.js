/**
 * Module dependencies.
 */
var express = require('express'),
	http = require('http'),
	path = require('path'),
	colors = require('colors'),
	io = require('socket.io');


var app = express(),
	config = require('./lib/settings.js');

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
var lib = require('./lib/library.js'),
	users = require('./lib/users.js'),
	player = require('./lib/player.js')(lib),
	playlist = require('./lib/playlist.js')(users),
	socket = require('./lib/socketManager.js'),
	ip = require('./lib/localip.js');

users.init( socket.broadcastUsers , ip );

lib.init();

lib.exclude(config.lib.excludes);
lib.addFolder(config.lib.folders);

lib.load();
lib.onAnalyze(function(){
	player.stop();
	playlist.reset();
	socket.broadcastState({state:"analyze"});
});

playlist.init( socket.broadcastList , socket.broadcastCurrentSong , socket.broadcastState );
playlist.setForcePlay(function(){player.play();});

player.init( {autopilot:true,playlist:playlist} , socket.broadcastState );

playlist.setPlayer(player);

// ---------------------------
// Command line interpreter
require('./lib/commandInterpreter.js')({lib:lib,player:player,playlist:playlist,socket:socket,ip:ip,users:users});

process.on('exit', function(code) {
	//console.log('About to exit with code:', code);
	//lib.save();
	player.stop();
	config.save();
	socket.broadcastState({state:"off"}); // Broadcast exit
});

// Views
app.get('/', require('./routes').index);

// API
// Auth
app.get('/auth',function(req,res){
	if ( ! users.isLogged(req.connection.remoteAddress) )
		res.send('{"status":"error","type":1, "msj":"No estas loggeado"}');
	else {
		var usr = users.getUserfromIP(req.connection.remoteAddress);
		res.send('{"status":"ok","msj":"Estas loggeado","id":'+usr.id+',"name":"'+usr.name+'"}');
	}
		
});

app.post('/auth',function(req,res){
	if ( users.nameUsed(req.body.name) ) {
		res.send('{"status":"error","type":3, "msj":"Nombre en uso"}'); return;
	}
	var id = users.log(req.connection.remoteAddress,req.body.name);
	res.send('{"status":"ok", "msj":"Identificado como '+req.body.name+'", "id":'+id+'}');
});

app.get('/on',function(req,res){
	res.send('true');
});

// Chat
app.post('/chat', function(req, res){
	if ( ! users.isLogged(req.connection.remoteAddress) ) {
		res.send('{"status":"error", "type":1, "msj":"No estas loggeado"}'); return;
	}
	res.send('{"status":"ok", "msj":"Mensaje enviado"}');
	socket.broadcastChat({user:users.getName(req.connection.remoteAddress),msj:req.body.mensaje});
});

// Usuarios
app.get('/users', function(req, res){
	res.send(users.getUsers());
});

// Navegación
app.post('/api/nav', function(req, res){
	var ret = {music:lib.navSongs(req.body.folder),folders:null};
	if ( req.body.dirs == 'on' ) ret.folders = lib.navFolder(req.body.folder);
	res.send(JSON.stringify(ret));
});

// Next
app.get('/api/votenext', function(req, res){
	if ( ! users.isLogged(req.connection.remoteAddress) ) {
		res.send('{"status":"error", "type":1, "msj":"No estas loggeado"}'); return;
	}
	playlist.voteNext( users.getID(req.connection.remoteAddress) );

	res.send('{"status":"ok", "msj":"Voto enviado"}');
});

// Admin
app.post('/api/admin', function(req, res){
	if ( users.isAdmin(req.connection.remoteAddress) ) {
		res.send('{"status":"error", "type":0, "msj":"Necesitas permisos de administrador"}');
		return;
	}
	switch(req.body.accion){
		case "autopilot":
			player.autopilot = (req.body.var == 'true')?true:false;
			break;
		case "next":
			player.next(); break;
		case "play":
			player.play(); break;
		case "stop":
			player.stop(true); break;
		case "analyze":
			lib.analyze();
			socket.broadcastState({state:"libRefresh"});
			break;
		case "exit":
			process.exit(0); break;
	}
});

// Playlist
app.get('/api/queue/:id', function(req, res){
	if ( ! users.isLogged(req.connection.remoteAddress) ) {
		res.send('{"status":"error", "type":1, "msj":"No estas loggeado"}'); return;
	}
	if ( playlist.isSong(req.params.id) ) {
		res.send('{"status":"error", "type":2, "msj":"La cancion ya esta en la playlist"}'); return;
	}
	player.playlist.addSong(lib.files[req.params.id],users.getID(req.connection.remoteAddress));
	res.send('{"status":"ok","msj":"Cancion agregada"}');

});

app.get('/api/playlist', function(req, res){
	res.send(player.playlist.songs);
});
app.get('/api/current', function(req, res){
	var currentSong = player.playlist.current;
	if ( currentSong == null ) currentSong = {};
	res.send({listening:currentSong,status:player.state});
});

// Create Server con Socket
var server = http.createServer(app),
	io = io.listen(server, { log: false });

server.listen(app.get('port'), function(){
	console.log('Servidor creado en: '.green + (ip[0]+':'+app.get('port')).grey);
});

// Socket.io
socket.init(io.sockets);
/*io.sockets.on('connection',function(sock){
	sock.emit('',{});
});*/

/*
*	TO-DO List:
*
*		Smart playlist (orden de usuario, orden de votos)
*		Toolbar: StatusIcon, Login/changeUsername and Options (chat notif(?)), VoteNext
*		ID3 !!!
*
*/