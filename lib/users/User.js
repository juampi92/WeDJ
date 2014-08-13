/**
 * @module Users
 * @class User
 */
function User(opts) {
  this.id = opts.id || 0;
  this.name = opts.name || '';
  this.ip = opts.ip || '';
  this.admin = opts.admin || false;
  this.online = true;
  this.lastKnownOnline = opts.now || 0;
}

/**
 * Returns the User IP
 * @method getIP
 * @return {String}
 */
User.prototype.getIP = function() {
  return this.ip;
};

/**
 * @method getName
 * @return {String}
 */
User.prototype.getName = function() {
  return this.name;
};

/**
 * @method setName
 * @param  {String} val New Name
 */
User.prototype.setName = function(val) {
  this.name = val;
};

/**
 * @method isAdmin
 * @return {Boolean}
 */
User.prototype.isAdmin = function() {
  return this.admin;
};

/**
 * @method setAdmin
 * @param  {Boolean} val
 */
User.prototype.setAdmin = function(val) {
  this.admin = val;
};

/**
 * Exports instance to JSON
 * @method toJSON
 * @return {JSON}
 */
User.prototype.toJSON = function() {
  return {
    id: this.id,
    name: this.name,
    admin: this.admin,
    online: this.online
  };
};

module.exports = User;