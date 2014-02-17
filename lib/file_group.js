var fs = require('fs'),
    path = require('path'),
    id3 = require("id3js"),
    Song = require('./song.js');

function Group() {
  this.paths = [];
  this.files = [];
  this.excluded = [];
  this.watchTimer = null;
}

Group.prototype.checkAnalyze = function(){
	if ( ! fs.existsSync("./settings/paths.json") || ! fs.existsSync("./settings/library.json") )
		console.log( "WARNING: Es necesario analizar la libreria. No hay canciones disponibles./n Uso: analyze");
}

Group.prototype.analyze = function (dirs) {
	dirs = (Array.isArray(dirs) ? dirs : [ dirs ]);
	// Para todos los paths (hacer for desp)
	for (var i = dirs.length - 1; i >= 0; i--) {
		this.include('','',dirs[i]);
	};

	this.save();
}

Group.prototype.save = function(){
	console.log("Guardando Carpetas");
	fs.writeFileSync("./settings/paths.json",JSON.stringify(this.paths));

	console.log("Guardando Musicas");
	fs.writeFileSync("./settings/library.json",JSON.stringify(this.files));
}

Group.prototype.load = function(){
	this.paths = JSON.parse(fs.readFileSync("./settings/paths.json"));
	this.files = JSON.parse(fs.readFileSync("./settings/library.json"));
}

Group.prototype.include = function(absolute, parent , dir ){
	if(!dir) return this;
	var self = this;

	var p = absolute + dir.replace(/\\/g,"/");
	var isDirectory = fs.statSync(p).isDirectory();

		if (isDirectory) {
			if ( ! self.isExcluded(p) ) {
				
				self.paths.push({
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
			//id3({ file: p, type: id3.OPEN_LOCAL }, function(err, tags) {
			//	console.log(p);
		        var song = new Song({title:"?"/*tags.title.replace(/\u0000/g, '')*/,artist:"?"/*tags.artist.replace(/\u0000/g, '')*/,path:p});
		        self.files.push({
					song: song,
					folder: parent
				});
		    //});
		}			

	/**/

	return this;
};

Group.prototype.exclude = function(module) {
  this.excluded.push(module);
  return this;
};

// Exclude paths based on expressions (done just before rendering)
Group.prototype.isExcluded = function(path) {
	for (var i = this.excluded.length - 1; i >= 0; i--)
		if ( this.excluded[i] == path ) 
			return true;
	return false;
};

module.exports = Group;
