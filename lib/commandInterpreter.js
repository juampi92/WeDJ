module.exports = function(_this){

	function parseInput(arr , from){
		var desde = (! from)? 1:from;
		arr = arr.slice(desde);
		if ( arr.length == 0 ) return null;
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
				return _this.lang.get("lib.updated");
				break;
			case "addlib":
				if ( args == null ) { return (_this.lang.get("lib.error.nullInput")).red; break;}
				_this.lib.addFolder([ args ]);
					if ( debug ) return _this.lib.folders;
					else return _this.lang.trans("lib.added",args.green);
				break;
			case "addlibexc":
				if ( args == null ) { return (_this.lang.get("lib.error.nullInput")).red; break;}
				if ( ! _this.lib.addExclude([ args ]) && debug ) { return (_this.lang.get("lib.error.notexists")).red; break; }
					if ( debug ) return _this.lib.excluded;
					else return _this.lang.trans("lib.excluded",args.green);
				break;
			case "rmlib":
				if ( args == null ) { return (_this.lang.get("lib.error.nullInput")).red; break;}
				if ( ! _this.lib.rmFolder( args ) ) { return (_this.lang.get("lib.error.notexists")).red; break;}			
					if ( debug ) return _this.lib.folders;
					return _this.lang.trans("lib.removed",(args).green);				
				break;
			case "rmlibexc":
				if ( args == null ) { return (_this.lang.get("lib.error.nullInput")).red; break;}
				_this.lib.rmExclude(args);
					if ( debug ) return _this.lib.excluded;
					return _this.lang.trans("lib.unexcluded",(args).green);				
				break;
			case "showlibs":
				return _this.lib.folders;
				break;
			case "showexc":
				return _this.lib.excludes;
				break;
			case "id3Analyze":
				return _this.lang.get("lib.id3.analyze");
				_this.lib.id3Analyze();
				break;	
		// Playlist
			case "queue": _this.player.playlist.addSong(_this.lib.files[args],0); break;
			case "list": return _this.player.playlist.songs; break;
			case "song": return _this.lib.getSong(args); break;
			case "current": return _this.player.playlist.current; break;
			case "state": return _this.player.state; break;
			
		// Debug/UI
			case "lang":
				if ( args == null ) { return (_this.lang.get("cmd.nullInput")).red;}
				_this.lang.setLang(args);
				config.setLang(args);
				return _this.lang.get("cmd.langChange").green + args.grey;
				break;
			case "savecfg": 
				config.save(_this.lib);
				return _this.lang.get("config.saved").green;
				break;
			case "ip": 
				return _this.lang.get("config.IP").green + ": ".green + (_this.ip).grey; 
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
				var out = "-------------------------------".grey + "\n"+_this.lang.get("cmd.help.correctUse")+": \n\n";
					out += _this.lang.get("cmd.help.nav")+":\n";
					out += "\tnext".green + " - "+_this.lang.get("cmd.help.next")+"\n";
					out += "\tstop".green + " - "+_this.lang.get("cmd.help.stop")+"\n";
					out += "\tplay".green + " - "+_this.lang.get("cmd.help.play")+"\n";
					out += "\n"+_this.lang.get("cmd.help.lib")+":\n";
					out += "\tanalyze".green + " - "+_this.lang.get("cmd.help.analyze")+"\n";
					out += "\taddlib".green + " <".grey+_this.lang.get("cmd.help.abs_path").grey+">".grey+" - "+_this.lang.get("cmd.help.addlib")+"\n";
					out += "\taddlibexc".green + " <".grey+_this.lang.get("cmd.help.abs_path").grey+">".grey+" - "+_this.lang.get("cmd.help.addlibexc")+"\n";
					out += "\tshowlibs".green + " - "+_this.lang.get("cmd.help.showlibs")+"\n";
					out += "\tshowexc".green + " - "+_this.lang.get("cmd.help.showexc")+"\n";
					out += "\tnavFolder".green + " <".grey+_this.lang.get("cmd.help.folder").grey+">".grey+" - "+_this.lang.get("cmd.help.navFolder")+"\n";
					out += "\tnavSongs".green + " <".grey+_this.lang.get("cmd.help.folder").grey+">".grey+" - "+_this.lang.get("cmd.help.navSongs")+"\n";
					out += "\n"+_this.lang.get("cmd.help.repr")+":\n";
					out += "\tqueue".green + " <".grey+_this.lang.get("cmd.help.song_id").grey+">".grey + " - "+_this.lang.get("cmd.help.queue")+"\n";
					out += "\tlist".green + " - "+_this.lang.get("cmd.help.list")+"\n";
					out += "\tsong".green + " <".grey+_this.lang.get("cmd.help.song_id").grey+">".grey + " - "+_this.lang.get("cmd.help.song")+"\n";
					out += "\tcurrent".green + " - "+_this.lang.get("cmd.help.current")+"\n";
					out += "\tstate".green + " - "+_this.lang.get("cmd.help.state")+"\n";
					out += "\n\n";
					out += "\tlang".green + " <".grey+_this.lang.get("cmd.help.lang_code").grey+">".grey + " - "+_this.lang.get("cmd.help.lang")+"\n";
					out += "\tip".green + " - "+_this.lang.get("cmd.help.ip")+"\n";
					out += "\tsavecfg".green + " - "+_this.lang.get("cmd.help.savecfg")+"\n";
					out += "\tsay".green + " <".grey+_this.lang.get("cmd.help.msg").grey+">".grey+" - "+_this.lang.get("cmd.help.say")+"\n";
					out += "\texit".green + " - "+_this.lang.get("cmd.help.exit")+"\n";
					out += "-------------------------------\n".grey;
				/* Trad List:

				*/
				return out;
				break;
			case "exit":
				process.exit(0);
				break;
			default:
				return _this.lang.get("cmd.wrong"); break;
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