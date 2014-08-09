module.exports = function(app) {
  /**
   * @class WebPlayer
   * @extends BasePlayer
   * @module Player
   */
  var WebPlayer = require('./BasePlayer.js')(app);

  /**
   * Defines playSong for WebPlayer
   *  [Description of method]
   * @method playSong
   * @param  {String} song Path to song
   */
  WebPlayer.playSong = function(song) {};
  /**
   * Defines stop song for WebPlayer
   *  [Description of method]
   * @method stop
   * @param  {Boolean} forced
   */
  WebPlayer.stop = function(forced) {
    if (forced) WebPlayer.changeState('stop');
  };

  return WebPlayer;
}