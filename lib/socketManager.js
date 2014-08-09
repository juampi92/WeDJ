/**
 * Socket Manager
 * @class SocketManager
 * @module  SocketManager
 */
var SocketManager = {
  /**
   * @property socketio
   * @type {Socket}
   * @default null
   */
  socketio: null,
  /**
   * Sets the socketio
   * @method init
   * @param  {Socket} sock
   */
  init: function(sock) {
    SocketManager.socketio = sock;
  },

  /**
   * Broadcasts the Playlist with the 'playlist' message
   * @method broadcastList
   * @param  {Array}      playlist Array of songs
   */
  broadcastList: function(playlist) {
    SocketManager.socketio.emit('playlist', playlist);
  },
  /**
   * Broadcasts the Current Song with the 'current' message
   * @method broadcastCurrentSong
   * @param  {Object}      current
   */
  broadcastCurrentSong: function(current) {
    SocketManager.socketio.emit('current', current);
  },
  /**
   * Broadcasts a Chat Message with the 'chat' message
   * @method broadcastChat
   * @param  {Object}      message Chat Message, and User
   */
  broadcastChat: function(message) {
    SocketManager.socketio.emit('chat', message);
  },
  /**
  * Broadcasts the State of the Player (stop,play) with the 'state' message
   * @method broadcastState
   * @param  {String}       state Name of the state
   */
  broadcastState: function(state) {
    SocketManager.socketio.emit('state', state);
  },
  /**
   * Broadcasts the list of Users with the 'users' message
   * @method broadcastUsers
   * @param  {Array}       users Array of Users
   */
  broadcastUsers: function(users) {
    SocketManager.socketio.emit('users', users);
  }
}

module.exports = SocketManager;