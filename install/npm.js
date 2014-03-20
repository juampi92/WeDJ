var fs = require('fs');

module.exports = function(app, callback){
	if ( ! fs.existsSync("npm.cmd") )
		app.autoupdater._remoteDownloadUpdate("npm.zip",
			{
				host:"nodejs.org", path:"/dist/npm/npm-1.4.3.zip", ssh:false } ,function(){
			app.autoupdater._extract("npm.zip",true,callback);
		});
	else callback();
}