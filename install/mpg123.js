var fs = require('fs');

module.exports = function(app , callback){
	if ( ! fs.existsSync("mpg123.exe") ) {
		loc = { host:"mpg123.de", path:"/download/win32/mpg123-1.18.0-static-x86.zip"};
		app.autoupdater._remoteDownloadUpdate("mpg123.zip",{ host: loc.host , path:loc.path , ssh:false } ,function(){
			app.autoupdater._extract("mpg123.zip",false,callback);
		});
	} else callback();
}