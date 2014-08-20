module.exports = function(app) {

  function parseInput(arr, from) {
    var desde = (!from) ? 1 : from;
    arr = arr.slice(desde);
    if (arr.length == 0) return null;
    return arr.join(" ");
  };

  var cmd = function(name, args, debug, callback) {
    switch (name) {
      // Navigation
      case "next":
        app.player.next();
        break;
      case "stop":
        app.player.stop(true);
        break;
      case "play":
        app.player.play();
        break;
      case "autopilot":
        app.player.setAutopilot(args);
        break;
        // Library
      case "analyze":
        app.lib.analyze();
        callback(app.lang.get("lib.starting"));
        break;
      case "addlib":
        if (args == null) {
          callback((app.lang.get("lib.error.nullInput")).red);
          break;
        }
        args = args.trim();
        if (!app.lib.addFolder([args])) {
          callback((app.lang.get("lib.error.notexists")).red);
          break;
        }
        if (debug) callback(app.config.lib.getFolders());
        else callback(app.lang.trans("lib.added", args.green));
        break;
      case "addlibexc":
        if (args == null) {
          callback((app.lang.get("lib.error.nullInput")).red);
          break;
        }
        args = args.trim();
        if (!app.lib.addExclude([args])) {
          callback((app.lang.get("lib.error.notexists")).red);
          break;
        }
        if (debug) callback(app.config.lib.getExcluded());
        else callback(app.lang.trans("lib.excluded", args.green));
        break;
      case "rmlib":
        if (args == null) {
          callback((app.lang.get("lib.error.nullInput")).red);
          break;
        }
        args = args.trim();
        if (!app.lib.rmFolder(args)) {
          callback((app.lang.get("lib.error.notexists")).red);
          break;
        }
        if (debug) callback(app.config.lib.getFolders());
        callback(app.lang.trans("lib.removed", (args).green));
        break;
      case "rmlibexc":
        if (args == null) {
          callback((app.lang.get("lib.error.nullInput")).red);
          break;
        }
        args = args.trim();
        if (!app.lib.rmExclude(args)) {
          callback((app.lang.get("lib.error.notexists")).red);
          break;
        }
        if (debug) callback(app.config.lib.getExcluded());
        callback(app.lang.trans("lib.unexcluded", (args).green));
        break;
      case "showlibs":
        callback(app.config.lib.getFolders());
        break;
      case "showexc":
        callback(app.config.lib.getExcluded());
        break;
      case "id3Analyze":
        callback(app.lang.get("lib.id3.analyze"));
        app.lib.id3Analyze();
        break;
        // Playlist
      case "queue":
        app.playlist.addSong(args, 0);
        break;
      case "list":
        callback(app.playlist.songs);
        break;
      case "song":
        callback(app.lib.getSong(args));
        break;
      case "current":
        callback(app.playlist.current);
        break;
      case "state":
        callback(app.player.state);
        break;
      case "search":
        app.lib.search(args, callback);
        break;

        // Debug/UI
      case "lang":
        if (args == null) {
          callback((app.lang.get("cmd.nullInput")).red);
        }
        app.lang.setLang(args);
        app.config.setLang(args);
        callback(app.lang.get("cmd.langChange").green + args.grey);
        break;
      case "savecfg":
        app.config.save(app.lib);
        callback(app.lang.get("config.saved").green);
        break;
      case "ip":
        callback(app.lang.get("config.IP").green + ": ".green + (app.ip[0] + ':' + app.get('port')).grey);
        break;
      case "navFolder":
        app.lib.navFolder(args, callback);
        break;
      case "navSongs":
        app.lib.navSongs(args, callback);
        break;
      case "say":
        app.socket.broadcastChat({
          user: 'server',
          msj: args
        });
        break;
      case "help":
        var out = "-------------------------------".grey + "\n" + app.lang.get("cmd.help.correctUse") + ": \n\n";
        out += app.lang.get("cmd.help.nav") + ":\n";
        out += "\tnext".green + " - " + app.lang.get("cmd.help.next") + "\n";
        out += "\tstop".green + " - " + app.lang.get("cmd.help.stop") + "\n";
        out += "\tplay".green + " - " + app.lang.get("cmd.help.play") + "\n";
        out += "\n" + app.lang.get("cmd.help.lib") + ":\n";
        out += "\tanalyze".green + " - " + app.lang.get("cmd.help.analyze") + "\n";
        out += "\taddlib".green + " <".grey + app.lang.get("cmd.help.abs_path").grey + ">".grey + " - " + app.lang.get("cmd.help.addlib") + "\n";
        out += "\taddlibexc".green + " <".grey + app.lang.get("cmd.help.abs_path").grey + ">".grey + " - " + app.lang.get("cmd.help.addlibexc") + "\n";
        out += "\tshowlibs".green + " - " + app.lang.get("cmd.help.showlibs") + "\n";
        out += "\tshowexc".green + " - " + app.lang.get("cmd.help.showexc") + "\n";
        out += "\tnavFolder".green + " <".grey + app.lang.get("cmd.help.folder").grey + ">".grey + " - " + app.lang.get("cmd.help.navFolder") + "\n";
        out += "\tnavSongs".green + " <".grey + app.lang.get("cmd.help.folder").grey + ">".grey + " - " + app.lang.get("cmd.help.navSongs") + "\n";
        out += "\n" + app.lang.get("cmd.help.repr") + ":\n";
        out += "\tqueue".green + " <".grey + app.lang.get("cmd.help.song_id").grey + ">".grey + " - " + app.lang.get("cmd.help.queue") + "\n";
        out += "\tlist".green + " - " + app.lang.get("cmd.help.list") + "\n";
        out += "\tsong".green + " <".grey + app.lang.get("cmd.help.song_id").grey + ">".grey + " - " + app.lang.get("cmd.help.song") + "\n";
        out += "\tcurrent".green + " - " + app.lang.get("cmd.help.current") + "\n";
        out += "\tstate".green + " - " + app.lang.get("cmd.help.state") + "\n";
        out += "\n\n";
        out += "\tlang".green + " <".grey + app.lang.get("cmd.help.lang_code").grey + ">".grey + " - " + app.lang.get("cmd.help.lang") + "\n";
        out += "\tip".green + " - " + app.lang.get("cmd.help.ip") + "\n";
        out += "\tsavecfg".green + " - " + app.lang.get("cmd.help.savecfg") + "\n";
        out += "\tsay".green + " <".grey + app.lang.get("cmd.help.msg").grey + ">".grey + " - " + app.lang.get("cmd.help.say") + "\n";
        out += "\texit".green + " - " + app.lang.get("cmd.help.exit") + "\n";
        out += "-------------------------------\n".grey;
        /* Trad List:
         
         */
        callback(out);
        break;
      case "exit":
        process.exit(0);
        break;
      default:
        callback(app.lang.get("cmd.wrong"));
        break;
    }
  }

  //console.log(this);
  var readline = require('readline'),
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  rl.on('line', function(input) {
    // Commands:
    input = input.split(" ");
    var comando = input[0];
    cmd(comando, parseInput(input), false, console.log);
  });

  return cmd;
}