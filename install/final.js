var fs = require('fs');

module.exports = function(app,callback) {
	// Crear run.bat
		console.log("Creando run.bat".bold.green);
		fs.writeFile('run.bat', 'node app.js\npause', function (err) {
			if (err) throw err;
			callback();
		});
}