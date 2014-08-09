var fs = require('fs');

module.exports = function(app) {

  // Views: diseño de la página.
  app.get('/', function(req, res) {
    res.render('index', {
      title: 'WeDJ',
      ip: app.ip[0] + ':' + app.get('port'),
      admin: app.users.isAdmin(req.connection.remoteAddress),
      lang: app.lang.get("view"),
      langjs: JSON.stringify(app.lang.get("view.js"))
    })
  });

  // API
  // Auth
  app.get('/auth', function(req, res) {
    if (!app.users.isLogged(req.connection.remoteAddress))
      res.send('{"status":"error","type":1, "msj":"' + app.lang.get("api.notLogged") + '","admin":"' + app.users.isAdmin(req.connection.remoteAddress) + '"}');
    else {
      var usr = app.users.getUserfromIP(req.connection.remoteAddress);
      res.send('{"status":"ok","msj":"' + app.lang.get("api.logged") + '","id":' + usr.id + ',"name":"' + usr.name + '","admin":"' + app.users.isAdmin(req.connection.remoteAddress) + '"}');
    }

  });

  app.post('/auth', function(req, res) {
    if (app.users.nameUsed(req.body.name)) {
      res.send('{"status":"error","type":3, "msj":"' + app.lang.get("api.nameInUse") + '"}');
      return;
    }
    var id = app.users.log(req.connection.remoteAddress, req.body.name);
    res.send('{"status":"ok", "msj":"' + app.lang.trans("api.loggedAs", req.body.name) + '", "id":' + id + ' , "admin":"' + app.users.isAdmin(req.connection.remoteAddress) + '"}');
  });

  app.get('/on', function(req, res) {
    res.send('true');
  });

  // Chat
  app.post('/chat', function(req, res) {
    if (!app.users.isLogged(req.connection.remoteAddress)) {
      res.send('{"status":"error", "type":1, "msj":"' + app.lang.get("api.notLogged") + '"}');
      return;
    }
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
    app.lib.navSongs(req.body.folder, function(canciones) {

      canciones.forEach(function(c) {
        if (app.playlist.isSong(c._id)) c.added = true;
      });

      if (req.body.dirs == 'on')
        app.lib.navFolder(req.body.folder, function(carpetas) {
          res.send(JSON.stringify({
            music: canciones,
            folders: carpetas
          }));
        });
      else res.send(JSON.stringify({
        music: canciones,
        folders: null
      }));
    });
  });

  app.post('/api/search', function(req, res) {
    if (req.body.query < 3) {
      res.send("[]");
      return;
    }
    app.lib.search(req.body.query, function(resultado) {
      for (var folders in resultado) {
        var folder = resultado[folders];
        for (var song in folder)
          if (app.playlist.isSong(folder[song]._id)) folder[song].added = true;
      }
      res.send(JSON.stringify(resultado));
    });
  });

  // Next
  app.get('/api/votenext', function(req, res) {
    if (!app.users.isLogged(req.connection.remoteAddress)) {
      res.send('{"status":"error", "type":1, "msj":"' + app.lang.get("api.notLogged") + '"}');
      return;
    }
    app.playlist.voteNext(app.users.getID(req.connection.remoteAddress));

    res.send('{"status":"ok", "msj":"' + app.lang.get("api.voteSent") + '"}');
  });

  // Admin
  app.post('/api/admin', function(req, res) {
    if (!app.users.isAdmin(req.connection.remoteAddress)) {
      res.send('{"status":"error", "type":0, "msj":"' + app.lang.get("api.adminAuth") + '"}');
      return;
    }
    app.command(req.body.accion, req.body.val, true, function(m) {
      res.send(JSON.stringify({
        status: "ok",
        msj: m
      }));
    });
  });

  // Playlist
  app.get('/api/queue/:id', function(req, res) {
    if (!app.users.isLogged(req.connection.remoteAddress)) {
      res.send('{"status":"error", "type":1, "msj":"' + app.lang.get("api.notLogged") + '"}');
      return;
    }
    if (app.playlist.isSong(req.params.id)) {
      res.send('{"status":"error", "type":2, "msj":"' + app.lang.get("api.songAlready") + '"}');
      return;
    }
    app.playlist.addSong(req.params.id, app.users.getID(req.connection.remoteAddress));
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
  app.get('/server', function(req, res) {
    if (!app.users.isAdmin(req.connection.remoteAddress))
      return res.send(app.lang.get("api.adminAuth"));

    res.render('server', {
      title: 'WeDJ Server',
      langjs: JSON.stringify(app.lang.get("server"))
    });
  });
  app.get('/server/current/:rand', function(req, res) {
    if (!app.users.isAdmin(req.connection.remoteAddress))
      return res.send(app.lang.get("api.adminAuth"));

    currentSong = app.playlist.current;
    if (currentSong != null)
      res.send(fs.readFileSync(app.playlist.getSongPath()));
    else
      res.send("false");
  });
}