module.exports = function(app){

	var _ = require('underscore');

	function Playlist() {
	  this.songs;
	  this.current;
	  this.callbacks;
	  this.auto;
	  this.player;
	  this.votenext;
	};

	Playlist.init = function( callbackPlaylist , callbackCurrent , callbackState ){
		this.songs = [];
		this.current = null;
		this.forcePlay = null;
		this.auto = false;
		this.player = null;
		this.votenext = [];
		this.callbacks = {
			changePlaylist: callbackPlaylist,
			changeCurrent: callbackCurrent,
			changeState: callbackState
		};
	};

	Playlist.setPlayer = function(plyr){
		this.player = plyr;
	};

	Playlist.reset = function(){
		this.songs = [];
		this.current = null;
	};

	Playlist.setForcePlay = function(callback){
		this.forcePlay = callback;
	};

	Playlist.start = function(){
		if ( this.current == null && this.next() == null ) return false;
		return true;
	};

	Playlist.isSong = function( track ) {
		return ( this.getSong(track) != null );
	};

	Playlist.setSong = function (song){
		if ( this.current == null )
			this.current = song;
		this.auto = true;
		this.callbacks.changeCurrent(this.current);
	};

	Playlist.addSong = function( track , user ) {
		var self = this;

		app.music_tag.analyze( track , function(e) {
			track.added = user;
			self.songs.push(track);
			
			console.log(" + ".bold.cyan + app.lang.trans("playlist.add",[ (app.users.getUser(user).name).grey , (track.path).green]));
			if ( self.forcePlay != null && self.songs.length == 1 && ( self.current == null || self.auto == true ) ) {
				self.auto = false;
				self.next();
				self.forcePlay(true);
			} else {
				self.callbacks.changePlaylist(self.songs);
			}
		});
	};

	Playlist.removeSong = function( songid ){
		song = Playlist.getSong(songid);
		if ( song != null ) this.songs.splice(song, 1);
	};

	Playlist.next = function() {
		this.end();

		if ( this.end() ) return null;

		this.current = this.songs.shift();

		this.callbacks.changeCurrent(this.current);
		
		return this.current;
	};

	Playlist.isEnd = function() {
		return (this.songs.length < 1);
	};
	Playlist.end = function(){
		if ( this.current != null ) {
			this.current.added = this.current.voted = null;
			this.current = null;
		}
		this.votenext = [];
	};
	Playlist.getSongPath = function() {
		return this.current.folder + '/' + this.current.path;
	};
	Playlist.getSongName = function() {
		return this.current.artist + " - " + this.current.title;
	};
	Playlist.songEnded = function() {
		this.current.played++;
		this.current.added = this.current.voted = null;
		this.auto = false;
	};
	Playlist.getSong = function(id){
		for (var i = this.songs.length - 1; i >= 0; i--)
			if ( this.songs[i].id == id ) return this.songs[i];
		return null;
	};
	Playlist.songVote = function(song,user){
		var song = this.getSong(song);
		if ( song == null ) return;
		if ( song.voted == null )
			song.voted = new Array();
		song.voted.push(user);
	};

	Playlist.voteNext = function(usr){
		if ( _.contains(this.votenext,usr) ) return;
		this.votenext.push(usr);

		var usrs = app.users.getUsers();
		
		if ( this.votenext.length >= Math.ceil((usrs.length)/2) ) {
			this.player.next(true);
		} else
			this.callbacks.changeState({state:"votenext",cant:this.votenext.length});
	};

	return Playlist;
}