module.exports = function(app) {
  /**
   * Returns the Player Class acording the config
   * @module Player
   */

  var Player;
  if (app.config.settings.getWebPlayer())
    Player = require('./WebPlayer.js')(app);
  else
    Player = require('./OSPlayer.js')(app);

  return Player;
};