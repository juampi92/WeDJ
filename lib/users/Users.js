module.exports = function(app) {

  var User = require('./User.js'),
    _ = require('underscore');

  var LOCAL_IP = '127.0.0.1';

  /**
   *
   * @module Users
   * @class Users
   * @requires User
   * @requires underscore
   */
  var Users = {
    /**
     * Array of Users
     * @property list
     * @type {Array}
     * @default []
     */
    list: [],
    /**
     * Function to call when changes are made
     * @property callback
     * @type {Function}
     */
    callback: null,
    /**
     * All the Admins, located in an Array of UserIDs
     * @property admins
     * @type {Array}
     */
    admins: [],
    /**
     * The local IP (to recognize the owner)
     * @property ip
     * @type {String}
     * @default 0
     */
    ip: '',
    /**
     * Initiates the Users
     * @method init
     * @param  {Function} callbackChanges
     * @param  {String} ip
     */
    init: function(callbackChanges, ip) {
      this.callback = callbackChanges;
      this.ip = ip[0];
      // Create server user:
      this.list.push(new User({
        id: 0,
        ip: LOCAL_IP,
        name: 'Server',
        admin: true
      }));
      this.admins.push(0);
    },
    /**
     * Logs in a new User, given it's name and ip
     * @method log
     * @param  {String} ip User's IP Adress
     * @param  {String} name User's Name
     * @return {Number} The New User ID
     */
    log: function(ip, name) {
      var new_id = this.list.length,
        isAdmin = (ip == LOCAL_IP || ip == this.ip),
        usr = new User({
          id: new_id,
          ip: ip,
          name: name,
          admin: isAdmin,
          now: Date.now()
        });

      this.list.push(usr);

      console.log(" # ".bold.cyan + app.lang.trans("users.logged", [(name).green, (ip).grey]));

      if (isAdmin) this.addAdmin(new_id);

      this.callback(this.getUsers());
      return new_id;
    },
    /**
     * Get the Admins list
     * @method getAdmin
     * @return {Array} Array of IDs
     */
    getAdmins: function() {
      return this.admins;
    },

    /**
     * Adds an User ID to the list of admins
     * @method addAdmin
     * @param  {Number} id
     */
    addAdmin: function(id) {
      if (!_.contains(this.admins, id))
        this.admins.push(id);
      this.getUser(id).setAdmin(true);
    },

    /**
     * Removes an UserID from the list of admins
     * @method removeAdmin
     * @param  {Number} id
     */
    removeAdmin: function(id) {
      this.admins = _.without(this.admins, id);
      this.getUser(id).setAdmin(false);
    },

    /**
     * Checks if some user from IP is admin
     * @method isAdminFromIP
     * @param  {[type]} ip [description]
     * @return {Boolean} [description]
     */
    isAdminFromIP: function(ip) {
      var usr = this.getUserfromIP(ip);
      return (usr && usr.isAdmin()) ? true : false;
    },

    /**
     * If IP is LOCAL_IP
     * @method isOwner
     * @param  {String} ip
     * @return {Boolean}
     */
    isOwner: function(ip) {
      return (ip == LOCAL_IP);
    },

    /**
     * Is IP logged
     * @method isLogged
     * @param  {String} ip
     * @return {Boolean} If IP exists in users list
     */
    isLogged: function(ip) {
      return (this.getUserfromIP(ip) !== null);
    },

    /**
     * Is a name is currently in use
     * @method nameUsed
     * @param  {String} name
     * @return {Boolean}
     */
    nameUsed: function(name) {
      for (var i = 0; i < this.list.length; i++)
        if (this.list[i].getName() == name) return true;

      if (name == '_unknown_') return true;

      return false;
    },

    /**
     * Returns the User, given the ID
     * @method getUser
     * @param  {Number} id
     * @return {User}
     */
    getUser: function(id) {
      return this.list[id];
    },

    /**
     * Given an IP, returns the User
     * @method getUserfromIP
     * @param  {String} ip
     * @return {User} User, or null if not found
     */
    getUserfromIP: function(ip) {
      for (var i = 1, max = this.list.length; i < max; i++)
        if (this.list[i].getIP() == ip) return this.list[i];
      return null;
    },

    /**
     * Ginven an IP Adress, returns the User Name
     * @method getName
     * @param  {String} ip
     * @return {String} User Name, or _unknown_ if not found
     */
    getName: function(ip) {
      return (this.getUserfromIP(ip).getName() || '_unknown_');
    },

    /**
     * Given an IP Adress, returns the User ID
     * @method getID
     * @param  {String} ip
     * @return {Number} User ID, or null if not found
     */
    getID: function(ip) {
      return (this.getUserfromIP(ip).id || null);
    },

    /**
     * Returns an Array of Users
     *   (excludes the Server User)
     * @method getUsers
     * @return {Array} Array of Users
     */
    getUsers: function() {
      var arr = this.list.slice(1);
      return arr;
    }
  };
  return Users;
};