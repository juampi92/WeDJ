module.exports = function(_this){

	//console.log(this);
	var readline = require('readline'),
		rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.on('line', function (input) {
		// Commands:
		input = input.split(" ");
		var cmd = input[0];
		switch ( cmd ) {
			// Navigation
			case "next": _this.player.next(); break;
			case "stop": _this.player.stop(true); break;
			case "play": _this.player.play(); break;
			// Library
			case "analyze": 
				console.log("Analizando bibliotecas");
				_this.lib.analyze();
				console.log("Biblioteca actualizada");
				// Broadcast
				break;
			case "addlib":
				if ( parseInput(input) == undefined ) { console.log("Error: especificar biblioteca".red); break;}
				_this.lib.addFolder([ parseInput(input) ]);
				console.log("> "+parseInput(input)+" agregada a la biblioteca");
				break;
			case "addlibexc":
				if ( parseInput(input) == undefined ) { console.log("Error: especificar biblioteca".red); break;}
				_this.lib.exclude( parseInput(input) );
				console.log("> "+parseInput(input)+" excluida de la biblioteca");
				break;
			case "id3Analyze":
				console.log("> Analizando ID3");
				_this.lib.id3Analyze();
				break;	
			case "showlibs":
				console.log(_this.lib.folders);
				break;
			case "showexc":
				console.log(_this.lib.excluded);
				break;
			case "queue": _this.player.playlist.addSong(_this.lib.files[input[1]],0); break;
			case "list": console.log(_this.player.playlist.songs); break;
			case "song": console.log(_this.lib.getSong(input[1])); break;
			case "current": console.log(_this.player.playlist.current); break;	
			
			// Debug/UI
			case "savecfg": 
				config.save();
				console.log("Config guardada".green);
				break;
			case "ip": 
				console.log('IP del servidor: '.green + (ip[0]+':'+app.get('port')).grey); 
				break;
			case "navFolder": 
				console.log( _this.lib.navFolder( parseInput(input) ) ); 
				break;
			case "navSongs":
				console.log(_this.lib.navSongs( parseInput(input) ));
				break; 
			case "music": console.log(_this.lib.paths); break;
			case "say": 
				_this.socket.broadcastChat({user:'server',msj: parseInput(input) });
				break;
			case "help":
				console.log("-------------------------------".grey + "\nUso correcto de los comandos: \n");
				console.log("Navegación:");
				console.log("\tnext".green + " - Siguiente cancion en la lista");
				console.log("\tstop".green + " - Detiene la reproducción");
				console.log("\tplay".green + " - Retoma/comienza la reproducción\n");
				console.log("Libreria:");
				console.log("\tanalyze".green + " - Forza analizar bibliotecas");
				console.log("\taddlib".green + " <absolutepath>".grey+" - Agrega la carpeta a la lista de bibliotecas");
				console.log("\taddlibexc".green + " <absolutepath>".grey+"  - Excluye esa carpeta de la biblioteca");
				console.log("\tshowlibs".green + " - Muestra todas las librerias");
				console.log("\tshowexc".green + " - Muestra las carpetas excluidas");
				console.log("\tnavFolder".green + " <carpeta>".grey+"  - Muestra las sub-carpetas de esa carpeta");
				console.log("\tnavSongs".green + " <carpeta>".grey+"  - Muestra las canciones de esa carpeta");
				console.log("\nReproducción:");
				console.log("\tqueue".green + " <cancionID>".grey + " - Agrega la cancion a la playlist");
				console.log("\tlist".green + " - Muestra la playlist actual");
				console.log("\tsong".green + " <songID>".grey + " - Muestra los datos de la canción");
				console.log("\tcurrent".green + " - Muestra el tema actual");
				console.log("\tstate".green + " - El estado del reproductor");
				console.log("\n");
				console.log("\tip".green + " - Muestra la IP de red en la que se aloja el servidor");
				console.log("\tsavecfg".green + " - Guarda la configuración actual");
				console.log("\tsay".green + " <mensaje>".grey+" - Envía un mensaje al chat");
				console.log("\texit".green + " - Termina gentilmente la aplicación");
				console.log("-------------------------------\n".grey);
				break;
			case "exit":
				process.exit(0);
				break;
			default:
				console.log("Comando desconocido. Ingresa 'help' para mas informacion"); break;
		}
	});
	function parseInput(arr , from){
		var desde = (! from)? 1:from;
		arr = arr.slice(desde);
		return arr.join(" ");
	};
}