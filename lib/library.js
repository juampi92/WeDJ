var fs = require('fs'),
	_ = require('underscore'),
	//id3 = require('id3js')
    path = require('path');

module.exports = function(lang){

	function Library() {
		this.folders;
		this.paths;
		this.files;
		this.excluded;
		this.watchTimer;
		this.onAnalyzecallback;
	}

	Library.init = function(){
		this.folders = [];
		this.paths = [];
		this.files = [];
		this.excluded = [];
		this.watchTimer = null;
		this.onAnalyzecallback = null;
	}

	Library.checkAnalyze = function(){
		if ( ! fs.existsSync("./settings/paths.json") || ! fs.existsSync("./settings/library.json") ) {
			console.log( lang.get("error.warning").red + ": " + lang.get("lib.starter"));
			return true;
		}
		return false;
	}

	Library.analyze = function () {
		// Para todos los paths (hacer for desp)
		this.paths = [];
		this.files = [];
		for (var i = 0; i < this.folders.length; i++) {
			this.include('','',this.folders[i]);
		};

		this.save();

		if ( this.onAnalyzecallback != null ) this.onAnalyzecallback();
	}

	Library.onAnalyze = function(callback){
		this.onAnalyzecallback = callback;
	}

	Library.save = function( onlyMusica ){
		if ( onlyMusica != true ) {
			console.log(lang.get("lib.savingPaths"));
			fs.writeFileSync("./settings/paths.json",JSON.stringify(this.paths));
		}

		console.log(lang.get("lib.savingSongs"));
		fs.writeFileSync("./settings/library.json",JSON.stringify(this.files));
	}

	Library.load = function(){
		if ( this.checkAnalyze() ) return;
		this.paths = JSON.parse(fs.readFileSync("./settings/paths.json"));
		this.files = JSON.parse(fs.readFileSync("./settings/library.json"));
		console.log(lang.get("lib.libsLoaded"));
	}

	Library.include = function(absolute, parent , dir ){
		if(!dir) return this;
		var self = this;

		var p = absolute + dir.replace(/\\/g,"/");
		var isDirectory = fs.statSync(p).isDirectory();

			if (isDirectory) {
				if ( ! self.isExcluded(p) ) {
					
					self.paths.push({
						name: dir,
						path: p,
						parent: parent
					});

					return fs.readdirSync(p).forEach(function (f) {
						self.include( p + '/' , p , f );
					});
		    	}
		    	return;
			}

			if( path.extname(p) == '.mp3' ) {
				self.files.push({
					id: self.files.length,
					title: '?',
					artist: '?',
					path: dir,
					added: null,
					voted: null,
					played: 0,
					folder: parent
				});
			}			
		return this;
	};

	Library.addFolder = function(folderArray){
		this.folders = _.union( this.folders , folderArray );
	}

	Library.addExclude = function(folderArray) {
		this.excluded = _.union( this.excluded , folderArray );
	};

	Library.rmFolder = function(folder){
		this.folders = _.without(this.folders, folder);
	}

	Library.rmExclude = function(folder) {
		this.excluded = _.without(this.excluded, folder);
	};

	// Exclude paths based on expressions (done just before rendering)
	Library.isExcluded = function(path) {
		for (var i = 0; i < this.excluded.length; i++)
			if ( this.excluded[i] == path ) 
				return true;
		return false;
	};

	Library.navFolder = function(parent){
		var ret = new Array();
		for (var i = 0; i < this.paths.length; i++)
			if ( this.paths[i].parent == parent ) ret.push(this.paths[i]);
		return ret;
	}

	Library.navSongs = function(folder){
		var ret = new Array();
		for (var i = 0; i < this.files.length; i++)
			if ( this.files[i].folder == folder ) ret.push(this.files[i]);
		return ret;
	}

	Library.getSong = function(id){
		if ( id < this.files.length ) 
			return this.files[id];
		console.log(lang.get("playlist.notExists"));
		return null;
	}

	Library.getRandomSong = function(){
		return this.files[Math.floor((Math.random()*this.files.length))];
	}

	Library.getSongName = function(id){
		if ( id < this.files.length ) 
			return this.files[id].path;
		console.log(lang.get("playlist.notExists"));
		return null;
	}


	Library.id3Analyze = function(){
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