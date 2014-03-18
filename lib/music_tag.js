var fs = require('fs');
var mm = null;

module.exports = function(app){

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
		if ( song.title != '?' && song.artist != '?') { callback(null); return; }
		
		var stream = fs.createReadStream( song.folder +  '/' + song.path );
		mm(stream).on('metadata', function (result) {
			
			app.db.library.update({ _id: song._id }, { $set: { title: result.title , artist: result.artist[0] } },{},
			function (err, numReplaced, newDoc) {
				song.title = result.title;
				song.artist = result.artist[0];
				callback();
			});

		}).on('done',function(err){
			if (err) console.log(err);
			stream.destroy();
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