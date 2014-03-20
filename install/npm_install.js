module.exports = function(app , callback ){
	var spawn = require('child_process').spawn,
		subProc = spawn("npm.cmd",[ "install" ]);

	console.log(" == Instalando dependencias".cyan.bold );

	subProc.stdout.pipe(process.stdout);
	subProc.stderr.pipe(process.stderr);
	subProc.on('message', function(m){ console.log("msj: ",m); } );
	subProc.on('close', function(e){

		// Crear run.bat
		console.log("Creando run.bat".bold.green);
		fs.writeFile('run.bat', 'node app.js\npause', function (err) {
			if (err) throw err;
			console.log(" == Instalación completa! == ".bold.cyan);
			callback();
		});
	});
}