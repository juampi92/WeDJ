var fs = require('fs'),
	path = require('path'),
	colors = require('colors'),
	autoupdater = require('auto-updater')({check_git:false,autoupdate:true});

autoupdater.on('check-up-to-date',function(v){
	console.log("Tienes la última versión: " + v.yellow);
	downloadFiles();
});

autoupdater.on('check-out-dated',function(v_old , v){
	console.log("Tu versión no es la última. Tienes la "+v_old.red+ " de "+v.green);
});
autoupdater.on('update-downloaded',function(){
	console.log(" > ".cyan + "Update descargado en la máquina");
});
autoupdater.on('update-not-installed',function(){
	console.log(" > ".cyan + "Ya existe el update en la máquina. No es necesario descargarlo");
});
autoupdater.on('extracted',function(){
	console.log(" > > ".cyan + "Extracción completada");
	downloadFiles();
});

// Mensajes de descarga:
autoupdater.on('download-start',function(name){
	console.log("Iniciando la descarga de: ".cyan.bold + name.green);
});
autoupdater.on('download-update',function(name,perc){
	process.stdout.write(" - "+"Downloading ".grey + (perc).green + "%".green + " \033[0G");
});
autoupdater.on('download-end',function(name){
	console.log(" - "+"Downloaded ".grey + name.green);
});
autoupdater.on('download-error',function(err){
	console.log("Error en la descarga: ".red + err);
});

autoupdater.forceCheck();

function downloadFiles(){
	if ( autoupdater.jsons.client.needed != undefined && autoupdater.jsons.client.needed.length > 0 ) {
		var download = autoupdater.jsons.client.needed.shift();
		if ( ! fs.existsSync(download.file) ) {
			loc = download.url;
			autoupdater._remoteDownloadUpdate(download.dest,{ host: loc.host , path:loc.path , http:true } ,function(){
				if ( download.type == "zip" )
					autoupdater._extract(download.dest,( download.simple != undefined ),downloadFiles);
				else downloadFiles();
			});
		} else downloadFiles();
	} else npm_download();
};

function npm_download(){
	// Bajar Node:
	if ( ! fs.existsSync("npm.cmd") )
		autoupdater._remoteDownloadUpdate("npm.zip",{ host:"nodejs.org", path:"/dist/npm/npm-1.4.3.zip", http:true } ,function(){
			autoupdater._extract("npm.zip",true,npm_install);
		});
	else npm_install();
};

function npm_install(){
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
		});
	});
}