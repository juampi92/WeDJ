module.exports = function(app){

	function Users() {
		this.list;
		this.callback;
		this.admin;
		this.ip;
	};

	Users.init = function( callbackChanges , ip ){
		this.list = [];
		this.callback = callbackChanges;
		this.ip = ip[0];
		this.admin = 0;
		// Create server user:
		this.list.push({id:0,ip:'localhost',name:'Server',status:true});
	};

	Users.log = function(ip,name){
		var new_id = this.list.length;
		this.list.push({id:new_id,ip:ip,name:name,status:true});
		console.log(" # ".bold.cyan +  app.lang.trans("users.logged", [ (name).green , (ip).grey ]) );

		if ( this.isAdmin(ip) ) this.admin = new_id;

		this.callback(this.getUsers());

		return new_id;
	};
	Users.isAdmin = function(ip){
		return ( ip == '127.0.0.1' || ip == this.ip);
	};
	Users.getAdmin = function(){
		return this.list[this.admin];
	};
	Users.setOn = function(ip){
		var usr = this.getUserfromIP(ip);
		if ( usr != null ) usr.status = true;
	};
	Users.setOff = function(ip){
		var usr = this.getUserfromIP(ip);
		if ( usr != null ) usr.status = false;
	};

	Users.isLogged = function(ip){
		for (var i = 0; i < this.list.length; i++)
			if ( this.list[i].ip == ip ) return true;
		return false;
	};
	Users.nameUsed = function(name){
		for (var i = 0; i < this.list.length; i++)
			if ( this.list[i].name == name ) return true;

		if ( name == '_unknown_' ) return true;
		
		return false;
	};
	Users.getUser = function(id){
		return this.list[id];
	};
	Users.getUserfromIP = function(ip){
		for (var i = 0; i < this.list.length; i++)
			if ( this.list[i].ip == ip ) return this.list[i];
		return false;
	}
	Users.getName = function(ip){
		return ( this.getUserfromIP(ip).name || '_unknown_');
	};
	Users.getID = function(ip) {
		return ( this.getUserfromIP(ip).id || null);
	};

	Users.getUsers = function(){
		var arr = this.list.slice(1);
		return arr;
	}

	return Users;
};