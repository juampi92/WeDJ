module.exports = function(app , callback){
	app.autoupdater.on('check-up-to-date',function(v){
		console.log("Tienes la última versión: " + v.yellow); callback();
	});

	app.autoupdater.on('check-out-dated',function(v_old , v){
		console.log("Tu versión no es la última. Tienes la "+v_old.red+ " de "+v.green);
	});
	app.autoupdater.on('update-downloaded',function(){
		console.log(" > ".bold.cyan + "Update descargado en la máquina");
		console.log(" > > ".bold.cyan + "Extrayendo...");
	});
	app.autoupdater.on('update-not-installed',function(){
		console.log(" > ".bold.cyan + "Ya existe el update en la máquina. No es necesario descargarlo");
		console.log(" > > ".bold.cyan + "Extrayendo...");
	});
	app.autoupdater.on('extracted',function(){
		console.log(" > > ".bold.cyan + "Extracción completada"); callback();
	});

	app.autoupdater.forceCheck();
};