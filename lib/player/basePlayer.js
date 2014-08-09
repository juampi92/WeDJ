module.exports = function(app) {
  /**
   * Player Class.
   *   Defines the current song, and the states of the song (playing,stopped)
   * @class  BasePlayer
   * @module Player
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
     * @property callbackState
     * @type {Function}
     * @default null
     */
    callbackState: null,
    /**
     * Pointer to the MusicTag
     * Used for analyzing music's meta tags (ID3)
     * @property music_tag
     * @type {Object MusicTag}
     * @default null
     */
    music_tag: null,
    /**
     * Pointer to the playlist
     * @property playlist
     * @type {PlayList}
     * @default null
     */
    playlist: null,
    /**
     * Pointer to the Library
     * @property lib
     * @type {Library}
     */
    lib: null,

    /**
     * Initiates the Player
     * @method init
     * @param  {Object} options {autopilot,}
     * @param  {Function} callbackState
     * @param  {Object MusicTag} music_tag     Used for analyzing ID3 Tags
     */
    init: function(options, callbackState) {
      if (options.autopilot != undefined) Player.autopilot = options.autopilot;
      this.callbackState = callbackState;
      this.state = "stop"; // Stop Play Auto End
      this.music_tag = app.music_tag;
      this.playlist = app.playlist;
      this.lib = app.lib;
    },
    /**
     * Stops the player, gets a song,
     *  get Music Tags if needed, sets the state,
     *  and plays the current song
     * @method play
     * @param  {Boolean} random If the song about to play is random
     */
    play: function(random) {
      Player.stop();
      if (!Player.playlist.start() && !random) return;

      Player.playlist.votenext = [];

      if (random) {

        Player.lib.getRandomSong(function(song) {
          Player.music_tag.analyze(song, function(e) {
            Player.playlist.setSong(song);
            Player.playCurrent(true);
          });
        });

      } else {
        Player.changeState("play");
        Player.playCurrent(false);
      }
    },
    /**
     * Logs into console the song that's currently playing
     * @method logPlaying
     * @param  {Boolean}   random
     */
    logPlaying: function(random) {
      console.log(" > ".cyan.bold +
        app.lang.trans("playlist.playing", [(Player.playlist.current.path).green]) +
        ((random) ? " [AutoPilot]" : ''));
    },
    /**
     * Logs the message, and uses interface "playSong"
     * @method playCurrent
     * @param  {Boolean}    random
     */
    playCurrent: function(random) {
      this.logPlaying(random);
      this.playSong(Player.playlist.getSongPath());
    },
    /**
     * Abstract
     *   This method should start playing the song in the speakers
     * @method playSong
     * @param  {String} path Path to song file
     */
    playSong: function(path) {},
    /**
     * Abstract
     *   This method should stop the current music from playing
     * @method stop
     * @param  {Bool} forced If it's a forced stop
     * @return {[type]}        [description]
     */
    stop: function(forced) {},
    /**
     * Function called when a song is over
     *   This notifies the playlist
     * @method songEnded
     */
    songEnded: function() {
      Player.playlist.songEnded();
    },
    /**
     * Plays next song
     * @method next
     */
    next: function() {
      if (Player.playlist.isEnd()) {
        Player.playlist.end();
        Player.stop();
        this.changeState((Player.autopilot) ? "auto" : "end");
        if (Player.autopilot) Player.play(true, true);
        return;
      }
      Player.playlist.next();
      Player.play();
    },
    /**
     * Changes the Player State, and notifies using the callbackStage
     * @method changeState
     * @param  {String} state
     */
    changeState: function(state) {
      this.state = state;
      this.callbackState({
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
          ap = !Player.autopilot;
      }

      if (Player.autopilot != ap) this.changeState("autopilot_" + ap);
      Player.autopilot = ap;
    }
  };

  return Player;
}