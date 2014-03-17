module.exports = function(lib,lang){
	var spawn = require('child_process').spawn;

	function Player() {
		this.playlist;
		this.autopilot;
		this.child;
		this.callbackState;
		this.state;
		this.music_tag;
	};

	Player.init = function ( options , callbackState , music_tag ){
		if ( options.playlist != undefined ) this.playlist = options.playlist; else this.playlist = null;
		if ( options.autopilot != undefined ) this.autopilot = options.autopilot; else this.autopilot = true;
		this.child = null;
		this.callbackState = callbackState;
		this.state = "stop"; // Stop Play Auto End
		this.music_tag = music_tag;
	};


	Player.play = function(auto , random){
		this.stop();
		if ( ! this.playlist.start() && !random ) return;

		if ( ! auto ) this.changeState("play");

		this.playlist.votenext = [];

		if ( random ) {
			var random_song = lib.getRandomSong(),
				self = this;
			this.music_tag.analyze( random_song , function(e) {
				self.playlist.setSong( random_song );
				self.playcurrent(true);
			});			
		} else {
			this.playcurrent(false);
		}
	};

	Player.playcurrent = function(random){
		console.log(" > ".cyan.bold + lang.trans("playlist.playing" , [ (this.playlist.current.path).green ] ) + ( (random)?" [AutoPilot]":'' ) );
		this.child = spawn("mpg123",[ this.playlist.getSongPath() ]);

		this.child.on('close', this.onClose );
	};

	Player.stop = function(forced){
		if ( this.child != null ) { 
			this.child.kill();
			if ( forced ) this.changeState("stop");
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
		this.playlist.songEnded();
	}

	Player.next = function(){
		if ( this.playlist.isEnd() ) {
			this.playlist.end();
			this.stop();
			this.changeState( ( this.autopilot ) ? "auto" : "end" );
			if ( this.autopilot ) this.play(true,true);
			return;
		}
		this.playlist.next();
		this.play(true);
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
			default: ap = ! this.autopilot;
		}

		if ( this.autopilot != ap ) this.changeState( "autopilot_" + ap );
		this.autopilot = ap;
	};

	return Player;
}