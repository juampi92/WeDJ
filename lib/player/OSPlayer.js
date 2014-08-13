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
   * Defines _playSong for OS Player
   *  Spawns a child node with the OS player
   * @method _playSong
   * @param  {String} song Path to song
   */
  OSPlayer._playSong = function(song) {
    this._stop();
    this.child = spawn('mpg123', [app.playlist.getSongPath()]);
    this.child.on('close', this.onClose);
  };

  /**
   * What to do when the child process is terminated
   * @method onClose
   * @param  {Number} code Exit code for the child process
   */
  OSPlayer.onClose = function(code) {
    if (code === null)
      return;
    else if (code === 0) {
      this.songEnded();
    } else
      console.log('Exit: ' + code); // Dewbug, no translate
  };

  /**
   * Defines _stop for OS Player
   *  It kills the child process, and if it's forced,
   *  it notifies the new stop state
   * @method _stop
   */
  OSPlayer._stop = function() {
    if (this.child !== null)
      this.child.kill();
  };

  return OSPlayer;
}