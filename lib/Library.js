module.exports = function(app) {

  var fs = require('fs'),
    _ = require('underscore'),
    Datastore = require('nedb'),
    path = require('path'),
    Song = require('./Song.js')(app);

  /**
   * @module Library
   * @class Library
   * @requires fs
   * @requires underscore
   * @requires nedb
   * @requires path
   * @requires Song
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
     * User for aminating the scanner
     * @property anim
     * @type {Object}
     */
    anim: {
      pos: 0,
      arr: ['|', '/', '-', '\\'] //['ooo','0oo','o0o','oo0']
    },
    /**
     * Variable used to track async recursion
     * @property count
     * @type {Number}
     */
    count: 0,

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
      if (app.config.lib.getLastAnalyze() == 0) {
        console.log(app.lang.get("error.warning").red + ": " + app.lang.get("lib.starter"));
        return true;
      } else
        return false;
    },
    /**
     * Loads DB, and sets it's Indexes, and total of songs
     * @method load
     */
    load: function(checkEmpty, callback) {
      var self = this;
      if (checkEmpty) empty = this.checkAnalyze();

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

      app.db.library.find({}, function(err, docs) {
        self.songs = docs.length;
      });

      if (checkEmpty && empty) callback(true);
      else callback(false);
    },

    /**
     * Analyzes the disc, searching for songs
     * @method analyze
     */
    analyze: function() {
      var self = this;

      // Delets previous db
      fs.unlinkSync('./settings/db/paths.db');
      fs.unlinkSync('./settings/db/library.db');

      this.load(false, function(e) {
        self.songs = 0;
        self.folders = 0;

        var folders = app.config.lib.getFolders();

        // If uploads
        if (app.config.lib.uploads.isEnabled()) {
          folders.push(app.config.lib.uploads.getFolder());
        }

        self.count = 0;
        self.tot = 0;

        for (var i = 0; i < folders.length; i++) {
          self._include('', folders[i], '', "0");
        };
      });

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

      var p = absolute + dir;
      try {
        var isDirectory = fs.lstatSync(p).isDirectory();
      } catch (e) {
        console.log("ERROR: ".red + e);
        app.config.lib.rmFolder(dir);
        return;
      }

      self.count++;
      if (isDirectory) {
        // Folder
        if (!self.isExcluded(p)) {

          /*
           * Insert Folder into DB
           */
          app.db.paths.insert({
            name: dir,
            path: p,
            parent: parent,
            parent_id: parent_id
          }, function(err, newPath) {
            if (err) throw err;
            var padre = newPath._id;
            self.folders++;
            fs.readdirSync(p).forEach(function(f) {
              self._include(p + '/', f, p, padre);
            });
            self._done();
          });
        }
        return;
      } else if (path.extname(p) == '.mp3') {

        /**
         * Insert
         */

        app.db.library.insert({
          title: '?',
          artist: '?',
          path: dir,
          played: 0,
          folder: parent,
          parent_id: parent_id,
        }, function(err, newsong) {
          //if ( err ) throw err;
          self.songs++;
          self._done();
        });
      } else
        self._done();
    },

    /**
     * Updates the info bar with the now ammount of files and folders scanned
     * @method _include_added
     * @private
     */
    _include_added: function() {
      process.stdout.write(" (" + (this.anim.arr[this.anim.pos]).bold.cyan + ") " + app.lang.get("lib.folders") + ": " + this.folders + " - " + app.lang.get("lib.songs") + ": " + this.songs + "       \033[0G");
      /* Use for debugging: " ...  " + this.count  */

      this.anim.pos++;
      if (this.anim.pos >= this.anim.arr.length) this.anim.pos = 0;
    },

    /**
     * Used for keeping count of the recursion.
     *  Knows when the loop is over and calls the proper function
     * @method _done
     * @private
     */
    _done: function() {
      this.count--;
      this._include_added();
      if (this.count == 0) {
        console.log();
        console.log(app.lang.get("lib.updated").green);
        this.onAnalyzecallback();
      }
    },
    /**
     * If folder exists, it adds it into the folders lib,in the config
     * @method addFolder
     * @param  {Array} folderArray Array of Folders
     * @return {Boolean} True if it's done successfully. False if some folder does not exist (so noone is added)
     */
    addFolder: function(folderArray) {
      for (var i = 0; i < folderArray.length; i++) {
        folderArray[i] = folderArray[i].replace(/\\/g, "/");
        if (folderArray[i].substring(folderArray[i].length - 1) == "/") folderArray[i] = folderArray[i].slice(0, -1);
        if (folderArray[i].substring(folderArray[i].length - 1) == ":") return false;
        if (!fs.existsSync(folderArray[i])) return false;
      }
      app.config.lib.addFolder(folderArray);
      return true;
    },
    /**
     * If folder exists, it adds it into the excludes lib, in the config
     * @param  {Array} folderArray Array of Folders
     * @return {Boolean} True if it's done successfully. False if some folder does not exist (so noone is added)
     */
    addExclude: function(folderArray) {
      console.log(folderArray);
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
        if (err)
          callback(null);
        else
          callback(sub_paths);
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
        if (err)
          callback(null);
        else
          callback(songs);
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
          //console.log(lang.get("playlist.notExists"));
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
     * @param  {Function} callback Param: Song
     */
    getSong: function(id, callback) {
      app.db.library.findOne({
        _id: id
      }, function(err, song) {
        if (err) {
          console.log(lang.get("playlist.notExists"));
          callback(null);
        } else
          callback(new Song(song));
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
        } else
          callback(new Song(song[0]));
      });
    },
    /**
     * Searchs the song name in the DB, given it's ID
     * @method getSongPath
     * @param  {Number} id
     * @param  {Function} callback Param: SongPath
     */
    getSongPath: function(id, callback) {
      this.getSong(id, function(song) {
        if (song === null)
          callback(null);
        else
          callback(song.getPath());
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