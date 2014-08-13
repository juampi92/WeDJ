module.exports = function(app) {

  var _ = require('underscore');

  /**
   * Player Class.
   *   Defines the current song, and the states of the song (playing,stopped)
   * @class  BasePlayer
   * @module Player
   * @requires underscore
   */
  var Player = {
    /**
     * @property autopilot
     * @type {Boolean}
     * @default true
     */
    autopilot: true,
    /**
     * @property state
     * @type {String}
     * @default 'stop'
     */
    state: 'stop',
    /**
     * Current Song
     * @property current
     * @type {Object}
     * @default null
     */
    current: null,
    /**
     * Object of functions mapping event name to callback
     * @property events
     * @type {Object}
     * @default {}
     */
    events: {},
    /**
     * Initiates the Player
     * @method init
     * @param  {Object} options {autopilot,}
     * @param  {Function} callbackState
     * @param  {Object MusicTag} music_tag     Used for analyzing ID3 Tags
     */
    init: function(options, callbackState, callbackCurrent) {
      if (options.autopilot != undefined) this.autopilot = options.autopilot;
      this.on('state', callbackState);
      this.on('current', callbackCurrent);

      /** Called from the playlist everytime they add a song
       * @event playlistAdded
       * @return {Boolean} If this returns true, then the song is
       *   inmediately played, and does not need to be added to the playlist
       */
      this.on('playlistAdded', function() {
        if (this.willAutoPlay()) {
          this.next();
          return true;
        } else
          return false;
      });

      this.state = "stop"; // Stop Play Auto End
    },

    /**
     * Sets an event
     * @method on
     * @param  {String} event Event name
     * @param  {Function} callback Event callback
     */
    on: function(event, callback) {
      this.events[event] = callback;
    },
    /**
     * Triggers an event
     *   Can use extra parameters as parameters to the callback
     * @method trigger
     * @param  {String} event Event name
     */
    trigger: function(event) {
      if (this.events[event])
        this.events[event].apply(this, _.toArray(arguments).slice(1));
    },

    /**
     * Logs into console the song that's currently playing
     * @method logPlaying
     * @param  {Boolean}   random
     */
    logPlaying: function(random) {
      console.log(" > ".cyan.bold +
        app.lang.trans("playlist.playing", [(this.current.path).green]) +
        ((random) ? " [AutoPilot]" : ''));
    },
    /**
     * Logs the message, and uses interface "_playSong"
     * @method playCurrent
     * @param  {Boolean}    random
     * @param {String} song Path to song
     */
    playSong: function(song) {
      this.setCurrent(song);
      this.logPlaying();
      this._playSong(song.getPath());
    },
    /**
     * Fetches a random song, and plays it
     * @method playRandomSong
     */
    playRandomSong: function() {
      app.lib.getRandomSong(function(song) {
        song.loadTags(function() {
          app.playlist.setSong(song);
          self.playSong(song);
        });
      });
    },
    /**
     * Abstract
     *   This method should start playing the song in the speakers
     * @method _playSong
     * @param  {String} path Path to song file
     */
    _playSong: function(path) {},
    /**
     * Stops the player
     * @method stop
     * @param  {Boolean} forced
     */
    stop: function(forced) {
      if (forced) this.changeState('stop');
      this._stop();
    },
    /**
     * Abstract
     *   This method should stop the current music from playing
     * @method _stop
     */
    _stop: function() {},
    /**
     * Function called when a song is over
     *   This notifies the playlist
     * @method songEnded
     */
    songEnded: function() {
      this.current.addPlayed();
      this.next();
    },
    /**
     * Sets the current song
     * @method setCurrent
     * @param  {Song} song
     */
    setCurrent: function(song) {
      this.current = song;
      this.trigger('current', song.toJSON());
    },
    /**
     * Plays next song
     * @method next
     */
    next: function() {
      if (app.playlist.isEnd()) {

        if (this.autopilot) {
          this.changeState('auto');
          this.playRandomSong();
        } else {
          this.stop();
          this.changeState('end');
        }

      } else {
        this.changeState('play');
        this.playSong(app.playlist.pullFirst());
      }
    },
    /**
     * Changes the Player State, and notifies using the callbackStage
     * @method changeState
     * @param  {String} state
     */
    changeState: function(state) {
      if (this.state == state) return;
      this.state = state;
      this.trigger('state', {
        state: state
      });
    },
    /**
     * Sets the AutoPilot for true or false, and notifies the change
     * @method setAutopilot
     * @param  {String}     mode Using a string for the command Interface
     */
    setAutopilot: function(mode) {
      var ap;
      switch (mode) {
        case "true":
          ap = true;
          break;
        case "false":
          ap = false;
          break;
        default:
          ap = !this.autopilot;
      }
      if (this.autopilot != ap)
        this.trigger('state', {
          state: "autopilot_" + ap
        });
      this.autopilot = ap;
    },

    /**
     * Returns true if the moment a song (manually) is added, it's played
     *   If there's no current song, the player is paused. And if there is autopilot, the player is taking new user-added song
     * @method willAutoPlay
     * @return {[type]} [description]
     */
    willAutoPlay: function() {
      return (!this.current || this.autopilot);
    }
  };

  return Player;
}