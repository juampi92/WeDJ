var fs = require('fs'),
	path = require('path'),
	colors = require('colors');

var app = {};

app.autoupdater = require('auto-updater')({check_git:false,autoupdate:true});

// Mensajes de descarga:
app.autoupdater.on('download-start',function(name){ console.log("Iniciando la descarga de: ".cyan.bold + name.green); });
app.autoupdater.on('download-update',function(name,perc){ process.stdout.write(" - "+"Downloading ".grey + (perc).green + "%".green + " \033[0G"); });
app.autoupdater.on('download-end',function(name){ console.log(" - " + "Downloaded ".grey + name.green); });
app.autoupdater.on('download-error',function(err){ console.log("Error en la descarga: ".red + err); });

var modules = new Array();
modules.push('wedj');
modules.push('mpg123');
//modules.push('bootstrap');
modules.push('npm');
modules.push('npm_install');
modules.push('final');

function run( module ){
	if ( module < modules.length )
		require( './install/' + modules[module] + '.js' )(app , function(){ run(++module) });
	else
		console.log(" == Instalación completa! == ".bold.cyan);
};

run(0);