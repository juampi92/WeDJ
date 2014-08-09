module.exports = function() {

  /**
   * @module Users
   * @class User
   */
  function User(opts) {
    this._id = opts.id || 0;
    this._name = opts.name || '';
    this._ip = opts.ip || '';
    this._admin = opts.admin || false;
    this._online = true;
    this._lastKnownOnline = opts.now || 0;
  }

  /**
   * Returns the User IP
   * @method getIP
   * @return {String}
   */
  User.prototype.getIP = function() {
    return this._ip;
  };

  /**
   * @method getName
   * @return {String}
   */
  User.prototype.getName = function() {
    return this._name;
  };

  /**
   * @method setName
   * @param  {String} val New Name
   */
  User.prototype.setName = function(val) {
    this._name = val;
  };

  /**
   * @method isAdmin
   * @return {Boolean}
   */
  User.prototype.isAdmin = function() {
    return this._admin;
  };

  /**
   * @method setAdmin
   * @param  {Boolean} val
   */
  User.prototype.setAdmin = function(val) {
    this._admin = val;
  };

  return User;
};