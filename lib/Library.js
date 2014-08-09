module.exports = function(app) {

  var fs = require('fs'),
    _ = require('underscore'),
    Datastore = require('nedb'),
    path = require('path');

  /**
   * @module Library
   * @class Library
   * @requires fs
   * @requires underscore
   * @requires nedb
   * @requires path
   */
  var Library = {
    /**
     * @property last_id
     * @type {Number}
     * @default 0
     */
    last_id: 0,
    /**
     * @propertu onAnalyzecallback
     * @type {Function}
     * @default null
     */
    onAnalyzecallback: null,
    /**
     * @property songs
     * @type {Number}
     * @default 0
     */
    songs: 0,
    /**
     * Initializes Library
     * @method init
     * @param  {Function} analyzeCallback
     */
    init: function(analyzeCallback) {
      this.onAnalyzecallback = analyzeCallback;
    },
    /**
     * Checks if the user needs to index some songs
     * @method checkAnalyze
     * @return {Boolean}
     */
    checkAnalyze: function() {
      if (!fs.existsSync("./settings/db/paths.db") || !fs.existsSync("./settings/db/library.db")) {
        console.log(app.lang.get("error.warning").red + ": " + app.lang.get("lib.starter"));
        return true;
      }
      return false;
    },
    /**
     * Loads DB, and sets it's Indexes, and total of songs
     * @method load
     */
    load: function() {
      var self = this,
        empty = this.checkAnalyze();

      // Instalar la db
      app.db.paths = new Datastore({
        filename: './settings/db/paths.db',
        autoload: true
      });
      app.db.library = new Datastore({
        filename: './settings/db/library.db',
        autoload: true
      });

      app.db.paths.ensureIndex({
        fieldName: 'parent_id'
      });
      app.db.library.ensureIndex({
        fieldName: 'parent_id'
      });
      app.db.library.ensureIndex({
        fieldName: 'id'
      });

      app.db.library.find({}, function(err, docs) {
        self.songs = docs.length;
      });

      if (!empty) console.log(app.lang.get("lib.libsLoaded"));
    },
    /**
     * Analyzes the disc, searching for songs
     * @method analyze
     */
    analyze: function() {
      // Para todos los paths (hacer for desp)
      this.songs = 0;


      var folders = app.config.lib.getFolders();
      for (var i = 0; i < folders.length; i++) {
        this._include('', folders[i], '', "0");
      };

      if (this.onAnalyzecallback != null) this.onAnalyzecallback();
    },
    /**
     * Sets the Callback for when the Analyzer is done analyzing
     * @method onAnalyze
     * @param  {Function} callback
     */
    onAnalyze: function(callback) {
      this.onAnalyzecallback = callback;
    },
    /**
     * If the path is a Directory, it adds it to the Paths DB, and crawls it.
     * If it's an mp3 file, it adds it to the Songs DB
     * @method _include
     * @param  {String} absolute Absolute Path (parent of dir)
     * @param  {String} dir Current Folder
     * @param  {String} parent Name of the parent folder
     * @param  {Number} parent_id ID of the parent folder
     * @private
     */
    _include: function(absolute, dir, parent, parent_id) {
      // Sobreescribir bien
      if (!dir) return;
      var self = this;

      var p = absolute + dir.replace(/\\/g, "/");
      var isDirectory = fs.statSync(p).isDirectory();

      if (isDirectory) {
        if (!self.isExcluded(p)) {

          app.db.paths.insert({
            name: dir,
            path: p,
            parent: parent,
            parent_id: parent_id
          }, function(err, newPath) {
            var padre = newPath._id;
            fs.readdirSync(p).forEach(function(f) {
              self._include(p + '/', f, p, padre);
            });
          });
        }
        return;
      } else if (path.extname(p) == '.mp3') {
        app.db.library.insert({
          title: '?',
          artist: '?',
          path: dir,
          added: null,
          voted: null,
          played: 0,
          folder: parent,
          parent_id: parent_id,
        });
        this.songs++;
      }
    },
    /**
     * If folder exists, it adds it into the folders lib,in the config
     * @method addFolder
     * @param  {Array} folderArray Array of Folders
     * @return {Boolean} True if it's done successfully. False if some folder does not exist (so noone is added)
     */
    addFolder: function(folderArray) {
      for (var i = 0; i < folderArray.length; i++)
        if (!fs.existsSync(folderArray[i])) return false;
      app.config.lib.addFolder(folderArray);
      return true;
    },
    /**
     * If folder exists, it adds it into the excludes lib, in the config
     * @param  {Array} folderArray Array of Folders
     * @return {Boolean} True if it's done successfully. False if some folder does not exist (so noone is added)
     */
    addExclude: function(folderArray) {
      for (var i = 0; i < folderArray.length; i++)
        if (!fs.existsSync(folderArray[i])) return false;
      app.config.lib.addExclude(folderArray);
      return true;
    },
    /**
     * Removes folders from the folder lib, in the config
     * @method rmFolder
     * @param  {Array} folder Array of folders
     */
    rmFolder: function(folder) {
      app.config.lib.rmFolder(folderArray);
    },
    /**
     * Removes folders from the exclude lib, in the config
     * @method rmExclude
     * @param  {Array} folder Array of folders
     */
    rmExclude: function(folder) {
      app.config.lib.rmExclude(folderArray);
    },
    /**
     * Given a path, it determines if it's excluded or not, checking the config
     * @method isExcluded
     * @param  {String} path
     * @return {Boolean}
     */
    isExcluded: function(path) {
      // Exclude paths based on expressions (done just before rendering)
      var excluded = app.config.lib.getExcluded();
      for (var i = 0; i < excluded.length; i++)
        if (excluded[i] == path)
          return true;
      return false;
    },
    /**
     * It returns async the sub folders, given a parent folder
     * @method navFolder
     * @param  {String} parent
     * @param  {Function} callback Function to call when it's done searching. Param: Array of matches
     */
    navFolder: function(parent, callback) {
      app.db.paths.find({
        parent_id: parent
      }).sort({
        name: 1
      }).exec(function(err, sub_paths) {
        if (err) callback(null);
        else callback(sub_paths);
      });
    },
    /**
     * It returns async the songs located in that folder
     * @method navSongs
     * @param  {String} folder
     * @param  {Function} callback Function to call when it's done searching. Param: Array of Songs
     */
    navSongs: function(folder, callback) {
      app.db.library.find({
        parent_id: folder
      }).sort({
        path: 1
      }).exec(function(err, songs) {
        if (err) callback(null);
        else callback(songs);
      });
    },
    /**
     * Searches the DB for the query (written in regEx)
     *   Callback Structure:
     *     [ "folderID" => [ song , ... ] , "folderID" => [ song , ... ] , ... ]
     * @method search
     * @param  {RegEx} query
     * @param  {Function} callback
     */
    search: function(query, callback) {
      app.db.library.find({
        path: {
          $regex: new RegExp('(' + query + ')', 'i')
        }
      }).sort({
        name: 1
      }).exec(function(err, songs) {
        if (err) {
          console.log(lang.get("playlist.notExists"));
          callback(null);
        } else {
          var folders = {};
          songs.forEach(function(song) {
            if (folders[song.parent_id] == null) folders[song.parent_id] = new Array();
            folders[song.parent_id].push(song);
          });
          callback(folders);
        }
      });
    },
    /**
     * Search the DB for that song, given it's ID
     * @method getSong
     * @param  {Number} id
     * @param  {Function} callback Param: song
     */
    getSong: function(id, callback) {
      app.db.library.findOne({
        _id: id
      }, function(err, song) {
        if (err) {
          console.log(lang.get("playlist.notExists"));
          callback(null);
        } else callback(song);
      });
    },
    /**
     * Search the DB for a Random Song
     * @method getRandomSong
     * @param  {Function} callback Param: song
     */
    getRandomSong: function(callback) {
      app.db.library.find({}).limit(1).skip(Math.floor((Math.random() * this.songs))).exec(function(err, song) {
        if (err) {
          console.log(err);
          callback(null);
        } else callback(song[0]);
      });
    },
    /**
     * Searchs the song name in the DB, given it's ID
     * @method getSongName
     * @param  {Number} id
     * @param  {Function} callback Param: SongPath
     */
    getSongName: function(id, callback) {
      this.getSong(id, function(song) {
        if (song === null) callback(null);
        else callback(song.path);
      });
    },

    /**
     * WAITING TO BE DELETED
     */
    id3Analyze: function() {
      /*for (var i = 0; i < this.files.length; i++) {
      id3({ file: this.files[i].folder+'/'+this.files[i].path, type: id3.OPEN_LOCAL }, function(err, tags) {
          if ( ! err )
            console.log(tags);
          else
            console.log("Error: "+err);
      });*/

    }
  };

  return Library;
};