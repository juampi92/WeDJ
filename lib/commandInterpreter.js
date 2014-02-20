module.exports = function(_this){

	function parseInput(arr , from){
		var desde = (! from)? 1:from;
		arr = arr.slice(desde);
		return arr.join(" ");
	};

	var cmd = function(name , args , debug){
		switch ( name ) {
		// Navigation
			case "next": 
				_this.player.next(); break;
			case "stop": 
				_this.player.stop(true); break;
			case "play": 
				_this.player.play(); break;
			case "autopilot": 
				_this.player.setAutopilot( args );
				break;
		// Library
			case "analyze": 
				_this.lib.analyze();
				return "Biblioteca actualizada";
				break;
			case "addlib":
				if ( args == undefined ) { return "Error: especificar biblioteca".red; break;}
				_this.lib.addFolder([ args ]);				
					if ( debug ) return _this.lib.folders;
					else return "> "+args+" agregada a la biblioteca";
				break;
			case "addlibexc":
				if ( args == undefined ) { return "Error: especificar biblioteca".red; break;}
				_this.lib.addExclude( args );				
					if ( debug ) return _this.lib.excluded;
					else return "> "+args+" excluida de la biblioteca";				
				break;
			case "rmlib":
				if ( args == undefined ) { return "Error: especificar biblioteca".red; break;}
				_this.lib.rmFolder(args);				
					if ( debug ) return _this.lib.folders;
					return "> "+args+" eliminada de la biblioteca";				
				break;
			case "rmlibexc":
				if ( args == undefined ) { return "Error: especificar biblioteca".red; break;}
				_this.lib.rmExclude(args);
					if ( debug ) return _this.lib.excluded;
					return "> "+args+" eliminada de las excluidas";				
				break;
			case "showlibs":
				return _this.lib.folders;
				break;
			case "showexc":
				return _this.lib.excluded;
				break;
			case "id3Analyze":
				return "> Analizando ID3";
				_this.lib.id3Analyze();
				break;	
		// Playlist
			case "queue": _this.player.playlist.addSong(_this.lib.files[args],0); break;
			case "list": return _this.player.playlist.songs; break;
			case "song": return _this.lib.getSong(args); break;
			case "current": return _this.player.playlist.current; break;	
			
		// Debug/UI
			case "savecfg": 
				config.save();
				return "Config guardada".green;
				break;
			case "ip": 
				return 'IP del servidor: '.green + (ip[0]+':'+app.get('port')).grey; 
				break;
			case "navFolder": 
				return  _this.lib.navFolder( args ); 
				break;
			case "navSongs":
				return _this.lib.navSongs( args );
				break;
			case "say": 
				_this.socket.broadcastChat({user:'server',msj: args });
				break;
			case "help":
				var out = "-------------------------------".grey + "\nUso correcto de los comandos: \n\n";
					out += "Navegación:\n";
					out += "\tnext".green + " - Siguiente cancion en la lista\n";
					out += "\tstop".green + " - Detiene la reproducción\n";
					out += "\tplay".green + " - Retoma/comienza la reproducción\n\n";
					out += "Libreria:\n";
					out += "\tanalyze".green + " - Forza analizar bibliotecas\n";
					out += "\taddlib".green + " <absolutepath>".grey+" - Agrega la carpeta a la lista de bibliotecas\n";
					out += "\taddlibexc".green + " <absolutepath>".grey+"  - Excluye esa carpeta de la biblioteca\n";
					out += "\tshowlibs".green + " - Muestra todas las librerias\n";
					out += "\tshowexc".green + " - Muestra las carpetas excluidas\n";
					out += "\tnavFolder".green + " <carpeta>".grey+"  - Muestra las sub-carpetas de esa carpeta\n";
					out += "\tnavSongs".green + " <carpeta>".grey+"  - Muestra las canciones de esa carpeta\n";
					out += "\nReproducción:\n";
					out += "\tqueue".green + " <cancionID>".grey + " - Agrega la cancion a la playlist\n";
					out += "\tlist".green + " - Muestra la playlist actual\n";
					out += "\tsong".green + " <songID>".grey + " - Muestra los datos de la canción\n";
					out += "\tcurrent".green + " - Muestra el tema actual\n";
					out += "\tstate".green + " - El estado del reproductor\n";
					out += "\n\n";
					out += "\tip".green + " - Muestra la IP de red en la que se aloja el servidor\n";
					out += "\tsavecfg".green + " - Guarda la configuración actual\n";
					out += "\tsay".green + " <mensaje>".grey+" - Envía un mensaje al chat\n";
					out += "\texit".green + " - Termina gentilmente la aplicación\n";
					out += "-------------------------------\n".grey;
				return out;
				break;
			case "exit":
				process.exit(0);
				break;
			default:
				return "Comando desconocido. Ingresa 'help' para mas informacion"; break;
		}
		return null;
	}

	//console.log(this);
	var readline = require('readline'),
		rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.on('line', function (input) {
		// Commands:
		input = input.split(" ");
		var comando = input[0];
		var res = cmd(comando , parseInput(input) );
		if ( res != null ) console.log(res);
		
	});

	return cmd;
}