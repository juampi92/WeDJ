module.exports = function(app){
	var spawn = require('child_process').spawn;

	function Player() {
		Player.autopilot;
		Player.child;
		this.state;
		this.callbackState;
	};

	Player.init = function ( options , callbackState , music_tag ){
		if ( options.autopilot != undefined ) Player.autopilot = options.autopilot; else Player.autopilot = true;
		Player.child = null;
		this.callbackState = callbackState;
		this.state = "stop"; // Stop Play Auto End
		Player.music_tag = music_tag;
	};


	Player.play = function(auto , random){
		Player.stop();
		if ( ! app.playlist.start() && ! random ) return;

		app.playlist.votenext = [];

		if ( random ) {

			app.lib.getRandomSong( function(song) {
				app.music_tag.analyze( song , function(e) {
					app.playlist.setSong( song );
					Player.playcurrent(true);
				});	
			});
					
		} else {
			Player.changeState("play");
			Player.playcurrent(false);
		}
	};

	Player.playcurrent = function(random){
		console.log(" > ".cyan.bold + app.lang.trans("playlist.playing" , [ (app.playlist.current.path).green ] ) + ( (random)?" [AutoPilot]":'' ) );
		Player.child = spawn("mpg123",[ app.playlist.getSongPath() ]);

		Player.child.on('close', Player.onClose );
	};

	Player.stop = function(forced){
		if ( Player.child != null ) { 
			Player.child.kill();
			if ( forced ) Player.changeState("stop");
		}
	};
		
	Player.onClose = function (code){
		if ( code == null ) return;
		else if ( code == 0 ) {
			Player.songEnded();
			Player.next();
		} else console.log('Exit: ' + code); // Dewbug, no translate
	};

	Player.songEnded = function(){
		app.playlist.songEnded();
	}

	Player.next = function(){
		if ( app.playlist.isEnd() ) {
			app.playlist.end();
			Player.stop();
			this.changeState( ( Player.autopilot ) ? "auto" : "end" );
			if ( Player.autopilot ) Player.play(true,true);
			return;
		}
		app.playlist.next();
		Player.play(true);
	};
	Player.changeState = function(estado){
		this.state = estado;
		this.callbackState({state:estado});
	};
	Player.setAutopilot = function(mode){
		var ap;
		switch(mode){
			case "true": ap = true; break;
			case "false": ap = false; break;
			default: ap = ! Player.autopilot;
		}

		if ( Player.autopilot != ap ) this.changeState( "autopilot_" + ap );
		Player.autopilot = ap;
	};

	return Player;
}