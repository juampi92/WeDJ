var fs = require('fs'),
  _ = require('underscore'),
  Datastore = require('nedb'),
  path = require('path');

module.exports = function(app) {

  function Library() {
    this.last_id;
    this.watchTimer;
    this.onAnalyzecallback;
    this.canciones;
  }

  Library.init = function(analyzeCallback) {
    this.watchTimer = null;
    this.onAnalyzecallback = analyzeCallback;
  }

  Library.checkAnalyze = function() {
    if (!fs.existsSync("./settings/db/paths.db") || !fs.existsSync("./settings/db/library.db")) {
      console.log(app.lang.get("error.warning").red + ": " + app.lang.get("lib.starter"));
      return true;
    }
    return false;
  }

  Library.load = function() {
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
      self.canciones = docs.length;
    });

    if (!empty) console.log(app.lang.get("lib.libsLoaded"));
  }

  Library.analyze = function() {
    // Para todos los paths (hacer for desp)
    this.canciones = 0;


    var folders = app.config.lib.getFolders();
    for (var i = 0; i < folders.length; i++) {
      this._include('', folders[i], '', "0");
    };

    if (this.onAnalyzecallback != null) this.onAnalyzecallback();
  }

  Library.onAnalyze = function(callback) {
    this.onAnalyzecallback = callback;
  }

  Library._include = function(absolute, dir, parent, parent_id) {
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
      this.canciones++;
    }
  };


  Library.addFolder = function(folderArray) {
    for (var i = 0; i < folderArray.length; i++)
      if (!fs.existsSync(folderArray[i])) return false;
    app.config.lib.addFolder(folderArray);
    return true;
  }

  Library.addExclude = function(folderArray) {
    for (var i = 0; i < folderArray.length; i++)
      if (!fs.existsSync(folderArray[i])) return false;
    app.config.lib.addExclude(folderArray);
    return true;
  };

  Library.rmFolder = function(folder) {
    app.config.lib.rmFolder(folderArray);
  }

  Library.rmExclude = function(folder) {
    app.config.lib.rmExclude(folderArray);
  };

  // Exclude paths based on expressions (done just before rendering)
  Library.isExcluded = function(path) {
    var excluded = app.config.lib.getExcluded();
    for (var i = 0; i < excluded.length; i++)
      if (excluded[i] == path)
        return true;
    return false;
  };

  Library.navFolder = function(parent, callback) {
    app.db.paths.find({
      parent_id: parent
    }).sort({
      name: 1
    }).exec(function(err, sub_paths) {
      if (err) callback(null);
      else callback(sub_paths);
    });
  }

  Library.navSongs = function(folder, callback) {
    app.db.library.find({
      parent_id: folder
    }).sort({
      path: 1
    }).exec(function(err, songs) {
      if (err) callback(null);
      else callback(songs);
    });
  }

  Library.search = function(query, callback) {
    // Arquitectura de la respuesta: [ "folderID" => [ song , ... ] , "folderID" => [ song , ... ] , ... ]
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
  };

  Library.getSong = function(id, callback) {
    app.db.library.findOne({
      _id: id
    }, function(err, song) {
      if (err) {
        console.log(lang.get("playlist.notExists"));
        callback(null);
      } else callback(song);
    });
  }

  Library.getRandomSong = function(callback) {
    app.db.library.find({}).limit(1).skip(Math.floor((Math.random() * this.canciones))).exec(function(err, song) {
      if (err) {
        console.log(err);
        callback(null);
      } else callback(song[0]);
    });
  }

  Library.getSongName = function(id, callback) {
    this.getSong(id, function(song) {
      if (song === null) callback(null);
      else callback(song.path);
    });
  }


  Library.id3Analyze = function() {
    /*for (var i = 0; i < this.files.length; i++) {
			id3({ file: this.files[i].folder+'/'+this.files[i].path, type: id3.OPEN_LOCAL }, function(err, tags) {
			    if ( ! err )
			    	console.log(tags);
			    else
			    	console.log("Error: "+err);
			});

		};*/
  }

  return Library;
};