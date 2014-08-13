module.exports = function(app) {

  /**
   * Filter
   * @class Filter
   * @module  Router
   * @param  {Object} req Request
   * @param  {Object} res Response
   */
  function Filter(req, res) {
    if (!(this instanceof Filter))
      return new Filter(req, res);
    this.req = req;
    this.res = res;
    this.last = true;
  };

  /**
   * Hashmap of filters to apply
   * @property filters
   * @type {Object}
   * @private
   */
  var filters = {};

  /**
   * Takes a filter name, runs that filter, and decides if it passes
   * @method validate
   * @param  {String} filter Name of the filter
   * @return {Filter} Returns itself
   */
  Filter.prototype.validate = function(filter) {
    var inverted = (filter.substr(0, 1) == '!');
    filter = (inverted) ? filter.substr(1) : filter;

    if (this.last)
      this.last = this.evaluate(filter, inverted);

    return this;
  };

  /**
   * Evaluates the given filter, using the filters Hash
   * @method evaluate
   * @param  {String} filter Name of the filter
   * @param  {Boolean} inverted If filter is negated
   */
  Filter.prototype.evaluate = function(filter, inverted) {
    var fltr = filters[filter];
    if (!fltr.condition(this.req) != !inverted) {
      this.res.json(fltr.error);
      return false;
    } else {
      return true;
    }
  };

  /**
   * Returns the result of the validation
   * @method run
   * @return {Boolean}
   */
  Filter.prototype.run = function() {
    return this.last;
  };

  /**
   * FILTERS
   */

  filters = {
    'logged': {
      condition: function(req) {
        return !app.users.isLogged(req.connection.remoteAddress);
      },
      error: {
        status: 'error',
        type: 1,
        msj: app.lang.get("api.notLogged")
      }
    },
    'admin': {
      condition: function(req) {
        return !app.users.isAdminFromIP(req.connection.remoteAddress);
      },
      error: {
        status: 'error',
        type: 0,
        msj: app.lang.get("api.adminAuth")
      }
    },
    'owner': {
      condition: function(req) {
        return !app.users.isOwner(req.connection.remoteAddress);
      },
      error: {
        status: 'error',
        type: 0,
        msj: app.lang.get("api.adminAuth")
      }
    },
  };

  return Filter;
};