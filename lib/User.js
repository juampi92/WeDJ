module.exports = function() {

  /**
   * @module Users
   * @class User
   */
  function User(opts) {
    this._name = opts.name || '';
    this._ip = opts.ip || 0;
    this._online = true;
    this._admin = opts.admin || false;
    this._lastKnownOnline = opts.now || 0;
  }

  Users.prototype.getIP = function() {
    return this._ip;
  };

  Users.prototype.getName = function() {
    return this._name;
  };
  User.prototype.setName = function(val) {
    this._name = val;
  };

  User.prototype.isAdmin = function() {
    return this._admin;
  };
  User.prototype.setAdmin = function(val) {
    this._admin = val;
  };

  return User;
};