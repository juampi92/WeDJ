var fs = require('fs');
var mm = null;

module.exports = function(){

	// If musicmetadata is installed:
	try {
	    require.resolve("musicmetadata");
	    mm = require('musicmetadata');
	} catch(e) {}
	
	function Music_tag(){

	}

	Music_tag.disabled = function(){
		return ( mm == null );
	}

	Music_tag.analyze = function( song , callback ){
		if ( mm == null ) { callback(false); return; }
		if ( song.title != '?' && song.artis != '?') { callback(null); return; }
		
		mm(fs.createReadStream( song.folder +  '/' + song.path )).on('metadata', function (result) {
			song.title = result.title;
			song.artist = result.artist[0];

			callback(result);
		}).on('done',function(err){
			if (err) console.log(err);
		});
	}

	Music_tag.getPic = function(song , callback ){
		if ( mm == null ) { callback(false); return; }
		mm(fs.createReadStream( song.folder +  '/' + song.path )).on('picture', function (result) {
			callback(result);
		}).on('done',function(err){
			if (err) console.log(err);
		});
	}

	//Music_tag.init();

	return Music_tag;
};