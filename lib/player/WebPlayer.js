module.exports = function(app) {
  /**
   * @class WebPlayer
   * @extends BasePlayer
   * @module Player
   */
  var WebPlayer = require('./BasePlayer.js')(app);

  /**
   * Defines _playSong for WebPlayer
   * @method _playSong
   * @param  {String} song Path to song
   */
  WebPlayer._playSong = function(song) {};
  /**
   * Defines _stop for WebPlayer
   * @method _stop
   */
  WebPlayer._stop = function() {};

  return WebPlayer;
}