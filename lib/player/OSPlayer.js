module.exports = function(app) {
  /**
   * @class OSPlayer
   * @extends BasePlayer
   * @requires child_process
   * @module Player
   */
  var OSPlayer = require('./BasePlayer.js')(app);

  var spawn = require('child_process').spawn;

  /**
   * @property child
   * @type {ChildProcess}
   * @default null
   */
  OSPlayer.child = null;

  /**
   * What to do when the child process is terminated
   * @method onClose
   * @param  {Number} code Exit code for the child process
   */
  OSPlayer.onClose = function(code) {
    if (code == null) return;
    else if (code == 0) {
      OSPlayer.songEnded();
      OSPlayer.next();
    } else console.log('Exit: ' + code); // Dewbug, no translate
  };

  /**
   * Defines playSong for OS Player
   *  Spawns a child node with the OS player
   * @method playSong
   * @param  {String} song Path to song
   */
  OSPlayer.playSong = function(song) {
    OSPlayer.child = spawn('mpg123', [app.playlist.getSongPath()]);
    OSPlayer.child.on('close', OSPlayer.onClose);
  };

  /**
   * Defines stop song for OS Player
   *  It kills the child process, and if it's forced,
   *  it notifies the new stop state
   * @method stop
   * @param  {Boolean} forced
   */
  OSPlayer.stop = function(forced) {
    if (OSPlayer.child != null) {
      OSPlayer.child.kill();
      if (forced) OSPlayer.changeState('stop');
    }
  };

  return OSPlayer;
}