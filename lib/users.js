module.exports = function(app) {

  var User = require('./User.js');

  /**
   *
   * @module Users
   * @class Users
   * @requires User
   */
  var Users = {
    list: [],
    callback: null,
    admin: 0,
    ip: 0,
    init: function(callbackChanges, ip) {
      this.callback = callbackChanges;
      this.ip = ip[0];
      // Create server user:
      this.list.push({
        id: 0,
        ip: 'localhost',
        name: 'Server',
        status: true
      });
    },
    log: function(ip, name) {
      var new_id = this.list.length;
      this.list.push({
        id: new_id,
        ip: ip,
        name: name,
        status: true
      });
      console.log(" # ".bold.cyan + app.lang.trans("users.logged", [(name).green, (ip).grey]));

      if (this.isAdmin(ip)) this.admin = new_id;

      this.callback(this.getUsers());

      return new_id;
    },
    isAdmin: function(ip) {
      return (ip == '127.0.0.1' || ip == this.ip);
    },
    getAdmin: function() {
      return this.list[this.admin];
    },
    setOn: function(ip) {
      var usr = this.getUserfromIP(ip);
      if (usr != null) usr.status = true;
    },
    setOff: function(ip) {
      var usr = this.getUserfromIP(ip);
      if (usr != null) usr.status = false;
    },
    isLogged: function(ip) {
      for (var i = 0; i < this.list.length; i++)
        if (this.list[i].ip == ip) return true;
      return false;
    },
    nameUsed: function(name) {
      for (var i = 0; i < this.list.length; i++)
        if (this.list[i].name == name) return true;

      if (name == '_unknown_') return true;

      return false;
    },
    getUser: function(id) {
      return this.list[id];
    },
    getUserfromIP: function(ip) {
      for (var i = 0; i < this.list.length; i++)
        if (this.list[i].ip == ip) return this.list[i];
      return false;
    },
    getName: function(ip) {
      return (this.getUserfromIP(ip).name || '_unknown_');
    },
    getID: function(ip) {
      return (this.getUserfromIP(ip).id || null);
    },
    getUsers: function() {
      var arr = this.list.slice(1);
      return arr;
    }
  };
  return Users;
};