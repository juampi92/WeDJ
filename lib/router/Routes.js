module.exports = function(app) {
  var fs = require('fs'),
    Filter = require('./Filter.js')(app);


  // Filter test:


  // ASSETS
  /**
   * Route: Lang.js
   *   Returns a javascript file with the selected language translations
   */
  app.get('/lang.js', function(req, res) {
    res.send("var lang = " + JSON.stringify(app.lang.get("view")) + ";");
  });

  // Auth
  app.get('/auth', function(req, res) {
    if (!Filter(req, res).validate('logged').run()) return;

    var usr = app.users.getUserfromIP(req.connection.remoteAddress);
    res.send('{"status":"ok","msj":"' + app.lang.get("api.logged") + '","id":' + usr.id + ',"name":"' + usr.getName() + '","admin":"' + usr.isAdmin() + '"}');

  });

  app.post('/auth', function(req, res) {
    if (app.users.nameUsed(req.body.name)) {
      res.send('{"status":"error","type":3, "msj":"' + app.lang.get("api.nameInUse") + '"}');
      return;
    }
    var id = app.users.log(req.connection.remoteAddress, req.body.name);
    res.send('{"status":"ok", "msj":"' + app.lang.trans("api.loggedAs", req.body.name) + '", "id":' + id + ',"admin":"' + app.users.getUser(id).isAdmin() + '"}');
  });

  app.get('/on', function(req, res) {
    res.send('true');
  });

  // Chat
  app.post('/chat', function(req, res) {
    if (!Filter(req, res).validate('logged').run()) return;

    res.send('{"status":"ok", "msj":"' + app.lang.get("api.msg_sent") + '"}');
    app.socket.broadcastChat({
      user: app.users.getName(req.connection.remoteAddress),
      msj: req.body.mensaje
    });
  });

  // Usuarios
  app.get('/users', function(req, res) {
    res.send(app.users.getUsers());
  });

  // Navegación
  app.post('/api/nav', function(req, res) {
    app.lib.navSongs(req.body.folder, function(songs) {

      songs.forEach(function(c) {
        if (app.playlist.isSongInPlaylist(c._id)) c.added = true;
      });

      if (req.body.dirs == 'on')
        app.lib.navFolder(req.body.folder, function(folders) {
          res.send(JSON.stringify({
            music: songs,
            folders: folders
          }));
        });
      else res.send(JSON.stringify({
        music: songs,
        folders: null
      }));
    });
  });

  app.post('/api/search', function(req, res) {
    if (req.body.query < 3) {
      res.send("[]");
      return;
    }
    app.lib.search(req.body.query, function(result) {
      for (var folders in result) {
        var folder = result[folders];
        for (var song in folder)
          if (app.playlist.isSongInPlaylist(folder[song]._id)) folder[song].added = true;
      }
      res.send(JSON.stringify(result));
    });
  });

  // Next
  app.get('/api/votenext', function(req, res) {
    if (!Filter(req, res).validate('logged').run()) return;

    app.playlist.voteNext(app.users.getID(req.connection.remoteAddress));

    res.send('{"status":"ok", "msj":"' + app.lang.get("api.voteSent") + '"}');
  });

  // Admin
  app.post('/api/admin', function(req, res) {
    if (!Filter(req, res).validate('admin').run()) return;

    app.command(req.body.accion, req.body.val, true, function(m) {
      res.send(JSON.stringify({
        status: "ok",
        msj: m
      }));
    });
  });

  // Playlist
  app.get('/api/queue/:id', function(req, res) {
    if (!Filter(req, res).validate('logged').run()) return;

    if (app.playlist.isSongInPlaylist(req.params.id)) {
      res.send('{"status":"error", "type":2, "msj":"' + app.lang.get("api.songAlready") + '"}');
      return;
    }
    app.playlist.addSong(req.params.id, app.users.getUserfromIP(req.connection.remoteAddress));
    res.send('{"status":"ok","msj":"' + app.lang.get("api.songAdded") + '"}');

  });

  app.get('/api/playlist', function(req, res) {
    res.send(app.playlist.songs);
  });

  app.get('/api/current', function(req, res) {
    currentSong = app.playlist.current;
    if (currentSong == null) currentSong = {};
    res.send({
      listening: currentSong,
      status: app.player.state
    });
  });

  // Server
  app.all('/server/*',function(req,res,next){
    if (!Filter(req, res).validate('owner').run()) return;
    next();
  });

  app.get('/server', function(req, res) {
    //if (!Filter(req, res).validate('owner').run()) return;

    res.render('server', {
      title: 'WeDJ Server',
      langjs: JSON.stringify(app.lang.get("server"))
    });
  });

  app.get('/server/current/:rand', function(req, res) {
    //if (!Filter(req, res).validate('owner').run()) return;

    currentSong = app.playlist.current;
    if (currentSong != null)
      res.send(fs.readFileSync(app.playlist.getSongPath()));
    else
      res.send('');
  });

  app.get('/server/next', function(req, res) {
    //if (!Filter(req, res).validate('owner').run()) return;

    app.player.songEnded();
    res.send(200);
  });
}