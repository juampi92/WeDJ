/**
 * @module Settings
 *
 * @requires fs
 * @requires underscore
 */

/**
 * Dependencies
 */
var fs = require('fs'),
  _ = require('underscore'),

  /**
   * Constant: Route to config file (.json)
   * @property cfg_route
   * @type {String}
   * @private
   */
  cfg_route = './settings/config.json';


/**
 * Config JSON.
 *
 * @property _config
 * @type {Object JSON}
 * @private
 */
var _config = {
  settings: {
    port: 3000,
    lang: 'es',
    def_open: true,
    webplayer: true,
  },
  lib: {
    lastAnalyze: 0,
    folders: [],
    excluded: []
  }
};

/**
 * Load config if exists
 */
if (fs.existsSync(cfg_route))
  _config = JSON.parse(fs.readFileSync(cfg_route));

/**
 * Create Dirs if not exits
 */
if (!fs.existsSync('./settings')) fs.mkdirSync('./settings');
if (!fs.existsSync('./settings/db')) fs.mkdirSync('./settings/db');

/**
 * Helper function. Given a property and a default value,
 *   checks if the property is undefined, and in that case,
 *   it sets it's default value, and returns the property
 * @method getter
 * @param  {Type} prop Pointer to property
 * @param  {Type} def  Default value to property
 * @return {Type}      The Property
 * @private
 */

function getter(obj, prop, def) {
  if (obj[prop] === undefined) obj[prop] = def;
  return obj[prop];
}

/**
 * Manage the Config
 * @class Config
 */
var Config = {
  /**
   * Saves config into disc
   * @method save
   */
  save: function() {
    fs.writeFileSync(cfg_route, JSON.stringify(this));
  },
  /**
   * Settings
   */
  settings: {
    /**
     * Gets the Language
     * @method settings.getLang
     * @return {String}
     */
    getLang: function() {
      return getter(_config.settings,'lang', 'es');
    },
    /**
     * Sets the language
     * @method settings.setLang
     * @param  {String} str
     */
    setLang: function(str) {
      _config.settings.lang = str;
    },
    /**
     * Gets the Port
     * @method settings.getPort
     * @return {Numeric}
     */
    getPort: function() {
      return getter(_config.settings,'port', 3000);
    },
    /**
     * Sets the Port
     * @method settings.setPort
     * @param  {Numeric} str
     */
    setPort: function(num) {
      _config.settings.port = num;
    },
    /**
     * Gets the Open Default
     *   If true, when the programm starts, it opens the app in the browser
     * @method settings.getDefOpen
     * @return {Boolean}
     */
    getDefOpen: function() {
      return getter(_config.settings,'def_open', false);
    },
    /**
     * Sets the Open Default
     * @method settings.setDefOpen
     * @param  {Boolean}   val
     */
    setDefOpen: function(val) {
      _config.settings.def_open = val;
    },
    /**
     * G
     * @method settings.getWebPlayer
     * @return {Boolean}     True if Web Player is used
     */
    getWebPlayer: function() {
      return getter(_config.settings,'webplayer', false);
    },
    /**
     * Sets the Player form: Web or OS
     * @method settings.setWebPlayer
     * @param  {Boolean}     val
     */
    setWebPlayer: function(val) {
      _config.settings.webplayer = false;
    },
  },

  /**
   * Library config
   */
  lib: {
    /**
     * Get Date of the last time there was a Disc Scan
     * @method lib.getLastAnalyze
     * @return {Date}
     */
    getLastAnalyze: function() {
      return getter(_config.lib,'lastAnalyze', 0);
    },
    /**
     * Sets the current date as the last time
     * @method lib.setLastAnalyze
     * @param  {Date}       now The current Date
     */
    setLastAnalyze: function(now) {
      _config.lib.lastAnalyze = now;
    },

    // Folders:
    /**
     * Gets the Folders to be scanned
     * @method lib.getFolders
     * @return {Array} Array of Paths (String)
     */
    getFolders: function() {
      return _config.lib.folders;
    },
    /**
     * Get Excluded folders from Scann
     * @method lib.getExcluded
     * @return {Array} Array of Paths (String)
     */
    getExcluded: function() {
      return _config.lib.excluded;
    },
    /**
     * Adds a an Array of folders to the current folders
     * @method lib.addFolder
     * @param  {Array} folderArray Array of Paths
     */
    addFolder: function(folderArray) {
      _config.lib.folders = _.union(_config.lib.folders, folderArray);
    },
    /**
     * Adds a an Array of folders to the excluded folders
     * @method lib.addExclude
     * @param  {Array} folderArray Array of Paths
     */
    addExclude: function(folderArray) {
      _config.lib.excludes = _.union(_config.lib.excludes, folderArray);
    },
    /**
     * Removes the given folder from the folders array
     * @method lib.rmFolder
     * @param  {String} folder Folder Path
     */
    rmFolder: function(folder) {
      _config.lib.folders = _.without(_config.lib.folders, folder);
    },
    /**
     * Removes the given folder from the excludes array
     * @method lib.rmExclude
     * @param  {String} folder Folder Path
     */
    rmExclude: function(folder) {
      _config.lib.excludes = _.without(_config.lib.excludes, folder);
    }
  }
};
module.exports = Config;