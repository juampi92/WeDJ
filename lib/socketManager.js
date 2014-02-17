function SocketManager() {
	SocketManager.socketio;
};

SocketManager.init = function ( sock ){
	SocketManager.socketio = sock;
};
SocketManager.broadcastList = function (playlist){
	SocketManager.socketio.emit('playlist', playlist);
}
SocketManager.broadcastCurrentSong = function (current){
	SocketManager.socketio.emit('current', current);
}
SocketManager.broadcastChat = function (message){
	SocketManager.socketio.emit('chat', message);
}
SocketManager.broadcastState = function (state){
	SocketManager.socketio.emit('state', state);
}
SocketManager.broadcastUsers = function (users){
	SocketManager.socketio.emit('users', users);
}

module.exports = SocketManager;