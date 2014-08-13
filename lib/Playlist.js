module.exports = function(app) {

  var _ = require('underscore'),
    Song = require('./Song.js')(app);

  /**
   * Playlist
   * @class  Playlist
   * @module Playlist
   * @requires underscore
   * @requires Song
   */
  var Playlist = {
    /**
     * Array of songs in the Playlist
     * @property songs
     * @type {Array}
     * @default []
     */
    songs: [],
    /**
     * Array of users who voted for the next song
     * @property votenext
     * @type {Array}
     * @default []
     */
    votenext: [],
    /**
     * Object of Functions to call when events happen in the playlist
     *   They broadcast the changes
     * @property callbacks
     * @type {Object}
     * @default {}
     */
    callbacks: {},

    /**
     * Initiates the Playlist setting it's callbacks
     * @method init
     * @param  {Function} callbackPlaylist Call when the Playlist changes
     * @param  {Function} callbackCurrent Call when the current song changes
     * @param  {Function} callbackState Call when the state changes
     */
    init: function(callbackPlaylist, callbackState) {
      this.callbacks = {
        changePlaylist: callbackPlaylist,
        changeState: callbackState
      };
    },

    /**
     * Empties the Playlist, and the Current song
     * @method reset
     */
    reset: function() {
      this.songs = [];
      this.votenext = [];
    },

    /**
     * Finds out if that song_id is in the Playlist
     * @method isSongInPlaylist
     * @param  {Number} song_id
     * @return {Boolean}
     */
    isSongInPlaylist: function(song_id) {
      return (this.getSong(song_id) !== null);
    },

    /**
     *
     * @method setSong
     * @param  {[type]} song [description]
     */
    setSong: function(song) {
      if (this.current == null)
        this.current = song;
      this.auto = true;
      this.callbacks.changeCurrent(this.current);
    },

    /**
     * Adds a song into the playlist
     * @method addSong
     * @param  {Number} song_id
     * @param  {User} user_id
     */
    addSong: function(song_id, user) {
      var self = this,
        user;

      if (this.isSongInPlaylist(song_id)) return;

      app.lib.getSong(song_id, function(song) {

        if (!song) return;

        song.loadTags(function() {
          song.setAdded(user);
          self.smartInsert(song, user);

          console.log(" + ".bold.cyan + app.lang.trans("playlist.add", [(user.getName()).grey, (song.path).green]));

          if (!app.player.trigger('playlistAdded'))
            self.callbacks.changePlaylist(self.toJSON());
        });
      });
    },

    /**
     * Inserts the song into the playlist
     * @method smartInsert
     * @param  {Song} song
     * @param  {User} user
     */
    smartInsert: function(song, user) {
      var cont_usrs = {},
        users = app.users.getUsers();
      for (var i = 0, max = users.length; i < max; i++)
        cont_usrs[users[i].id] = 0;

      users = null;

      var last = 0;
      for (var i = 0, max = this.songs.length; i < max; i++) {
        if (cont_usrs[user.id] < cont_usrs[this.songs[i].getAdded().id]++) {
          this.songs.splice(i, 0, song);
          return;
        }
      };
      this.songs.push(song);
    },

    /**
     * Removes a song from the Playlist
     * @method removeSong
     * @param  {Hash} songid
     */
    removeSong: function(songid) {
      this.songs = _.reject(this.songs, function(song) {
        return (song.getID() == songid);
      });
    },

    /**
     * Removes and returns the first element of the array of songs
     *   No need to notify changes. The player should tell that the current has changed
     * @method pullFirst
     * @return {Song} Return the current song, or null if it's the end of it
     */
    pullFirst: function() {
      if (this.isEnd()) return null;

      return this.songs.shift();
    },

    /**
     * Check if it's the end of the playlist
     * @method isEnd
     * @return {Boolean}
     */
    isEnd: function() {
      return (this.songs.length < 1);
    },

    /**
     * Returns the song, if it's in the Playlist
     * @method getSong
     * @param  {Number} id Song ID
     * @return {Song} Or Null if it's not in
     */
    getSong: function(id) {
      return (_.find(this.songs, function(song) {
        return song.getID() == id;
      }) || null);
    },

    /**
     * Vote the song UP
     * @method songVote
     * @param  {Number} song Song ID
     * @param  {User} user
     */
    songVote: function(song, user) {
      var song = this.getSong(song);
      if (!song) return;
      song.vote(user);
    },

    /**
     * Votes for the next song, and changes it if the condition applies
     * @method voteNext
     * @param  {User} usr User ID
     */
    voteNext: function(usr) {
      if (_.contains(this.votenext, usr)) return;
      this.votenext.push(usr);

      var usrs = app.users.getUsers();

      if (this.votenext.length >= Math.ceil((usrs.length) / 2))
        app.player.next();
      else
        this.callbacks.changeState({
          state: "votenext",
          cant: this.votenext.length
        });
    },

    /**
     * Exports to JSON
     * @method toJSON
     * @return {JSON}
     */
    toJSON: function() {
      return _.map(this.songs, function(song) {
        return song.toJSON();
      });
    }
  };

  return Playlist;
}