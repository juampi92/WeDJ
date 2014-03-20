var fs = require('fs');

module.exports = function(app, callback){
	if ( ! fs.existsSync("npm.cmd") )
		app.autoupdater._remoteDownloadUpdate("npm.zip",
			{
				host:"nodejs.org", path:"/dist/npm/npm-1.4.3.zip", http:true } ,function(){
			app.autoupdater._extract("npm.zip",true,callback);
		});
	else callback();
}