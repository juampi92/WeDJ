$(function(){
	
	var socket_off = false,
		$parent = $('#templates'),
		modals = {
		$auth: $parent.children('#authModal'),
		$offline: $parent.children('#offlineModal'),
	},
	// --------------------------------------------------------------------------------------
	// Auth
	// --------------------------------------------------------------------------------------
	Auth = {
		$modal: null,
		$input: null,
		$send: null,
		$alert: null,
		id: null,
		name: '',
		init: function( modal ){
			this.$modal = modal;
			this.$modal.modal({backdrop:'static', keyboard: false, show:false});
			this.$input = modal.find('form input');
			this.$send = modal.find('button');
			this.$alert = modal.find('.alert.alert-danger');

			this.clickEvent();
			// Try login:
			this.checkLogged();
		},
		checkLogged: function(){
			var self = this;
			$.getJSON( '/auth' , function( res ) {
				if ( res.status == "ok" ) {
					self.id = res.id;
					self.name = res.name;
				}
			});
		},
		clickEvent: function(){
			var self = this;
			this.$send.click(function(){
				self.$alert.hide();

				if ( self.$input.val() == '' ) { self.setError("Ingresar un nombre"); return; }
				
				self.sendAuth(self.$input.val() , function(){
					self.$modal.modal('hide');
				}, function(data){
					self.setError(msj);
				});
			});
		},
		sendAuth: function(nom , success , error ){
			var self = this;
			$.post( '/auth' , {name: nom } , function( data ) {
				var msj = ErrorHandler.handle(data,true);
				if ( msj !== true ) {
					if ( error != null ) error(msj);
				} else {
					self.id = data.id;
					self.name = self.$input.val();
					if ( success != null ) success();
				}				
			});
		},
		popup: function(fromError) {
			if ( this.name != '' ) { // Ya estaba loggeado, pero el servidor perdió su nombre
				this.sendAuth(this.name);
				return true;
			}
			if ( fromError == true )
				this.setError("Tenés que estar identificado para realizar eso");
			this.$modal.modal('show');
			return false;
		},
		setError: function(error){
			this.$alert.show();
			this.$alert.html(error);
		}

	},
	// --------------------------------------------------------------------------------------
	// Offline mode
	// --------------------------------------------------------------------------------------
	Offline = {
		$modal: null,
		$retry: null,
		set: false,
		init: function( modal ){
			this.$modal = modal;
			this.$modal.modal({backdrop:'static', keyboard: false, show:false});
		},
		popup: function(verified){
			if ( ! verified ) {
				$titulo = this.$modal.find('h4.modal-title').html('Problemas de conección');
				$cuerpo = this.$modal.find('.modal-body').html('O el servidor se desconectó, o hay problemas con la red local. <p>El cartel se cerrará si la conección se retoma en los próximos minutos.</p>');
			}
			this.set = true;
			this.$modal.modal('show');
		},
		clear: function(){
			this.set = false;
			this.$modal.modal('hide');
		},
		is: function(){
			return this.set;
		},
		giveUp: function(){
			var $titulo = this.$modal.find('h4.modal-title'),
				$cuerpo = this.$modal.find('.modal-body');

			$titulo.html('Servidor perdido');
			$cuerpo.html('Se perdió la conección con el servidor por completo. <p>Para volver a acceder, refresca la página</p>');
		}
	},
	// --------------------------------------------------------------------------------------
	// Error Handler
	// --------------------------------------------------------------------------------------
	ErrorHandler = {
		handle: function(json , getString) {
			if ( json.status == "error") {
				if ( json.type == 1 ) {
					Auth.popup(true);
				} else {
					if ( getString ) return json.msj;
					// ALertar de alguna forma
				}
				return false;
			} else
				return true;
		}
	};

	// --------------------------------------------------------------------------------------
	// Library Tree
	// --------------------------------------------------------------------------------------
	function LibraryTree( object , url , musicTree ) {
		this.$this = object;
		this.url = url;
		this.musicTree = musicTree;
		this.$active = null;
		this.load(this.$this,'',true);
		this.clickEvent();
	};

	LibraryTree.prototype.load = function( $dest , path , first ){
		var self = this,
			post_data = {folder:path,dirs:"off"},
			with_dirs = ($dest.data('loaded') != 'true');
		if ( with_dirs )
			post_data.dirs = "on";

		if ( !first )
			$dest.parent().addClass('wait');

		$.post( this.url , post_data , function( data ) {
			var res = JSON.parse(data);
			if ( with_dirs ) {
				if ( res.folders.length > 0 ) {
					$dest.data('subfolders','true');
					if ( !first ) $dest.parent().children('span').addClass('directory');

					for (var i = 0; i < res.folders.length; i++) {
						self.addFolder($dest,res.folders[i].name,res.folders[i].path);
					};

				} else {
					$dest.data('subfolders','false');
				}
				$dest.data('loaded','true');
			}
			
			// Iterar las canciones y agregarlas a la izquierda
			self.musicTree.load(res.music);

			if ( !first )$dest.parent().removeClass('wait');

			if ( $dest.data('subfolders') == 'true' ) {
				var $li = $dest.parent(),
					$span = $li.children('span'),
					$ul = $li.children('ul');
				if ( !first ) $span.addClass('expanded');
				$ul.show();
			}
		});
	}
	LibraryTree.prototype.clickEvent = function(){
		var self = this;
		this.$this.on('click', 'a', function(e){
			var $clicked = $(this);
			if ( self.$active != null ) self.$active.removeClass('active');
			self.$active = $clicked.parent();
			self.$active.addClass('active');
			self.load($clicked.parent().children('ul'),$clicked.data('dir'));			
		});
		this.$this.on('click', 'span', function(e){
			var $li = $(this).parent(),
				$span = $li.children('span'),
				$ul = $li.children('ul');

			if ( $span.hasClass('directory') ) {
				if ( $span.hasClass('expanded') ) {
					$span.removeClass('expanded');
					$ul.hide();
				} else {
					$span.addClass('expanded');
					$ul.show();
				}
			}
		});
		
	}
	LibraryTree.prototype.addFolder = function($parent,name,dir){
		$folder = $("<a></a>").addClass('folder').html(name).data('dir',dir);
		$li = $("<li></li>").append($("<span></span>")).append($folder).append($("<ul></ul>"));
		$parent.append($li);
	}
	LibraryTree.prototype.clear = function(){
		this.$this.empty();
		this.$this.data('loaded','false');
		this.load(this.$this,'',true);
	}

	// --------------------------------------------------------------------------------------
	// Files Tree
	// --------------------------------------------------------------------------------------
	function FilesTree( object , url ) {
		this.$this = object;
		this.url = url;
		this.clickEvent();
	};

	FilesTree.prototype.clickEvent = function(){
		var self = this;
		this.$this.on('click', 'a', function(e){ // dblclick doesnt work proper on touch
			var $a = $(this);

			if ( ! $a.hasClass('disabled') ) {
				$.getJSON( self.url + $a.data('id') , function( res ) {
					var exito = ErrorHandler.handle(res);
					if ( exito ) {
						$a.addClass('disabled');
					}
				});
			}
		});
	};

	FilesTree.prototype.load = function ( object ){
		this.clear();
		for (var i = 0; i < object.length; i++) {
			this.addFile( object[i] );
		};
	}

	FilesTree.prototype.addFile = function( object ) {
		var added = (object.added != null ),
			$file = $("<a></a>").html(object.path).data('id',object.id).data('added',added),
			$li = $("<li></li>").addClass('mp3').append($file);
		if ( added ) $file.addClass('disabled');
		this.$this.append($li);
	}
	FilesTree.prototype.clear = function() {
		this.$this.empty();
	}


	var fSfiles = new FilesTree($("#FSfiles"),'/api/queue/');
	var fSfolders = new LibraryTree($("#FSfolders"),'/api/nav',fSfiles);

	// --------------------------------------------------------------------------------------
	// Iniciar Modals
	Auth.init(modals.$auth);
	Offline.init(modals.$offline);

	// --------------------------------------------------------------------------------------
	// Playlist
	// --------------------------------------------------------------------------------------

	function Playlist( object ) {
		this.$this = object;
		this.clickEvents();
	};
	Playlist.prototype.clickEvents = function(){

	};
	Playlist.prototype.load = function(){
		var self = this;
		$.getJSON( '/api/playlist' , function(data){
			self.render(data);
		});
	};
	Playlist.prototype.render = function(object){
		this.$this.empty();
		if ( object.length > 0 )
			for (var i = 0; i < object.length; i++)
				this.addSong(object[i]);
		else
			this.$this.append($('<li></li>').addClass('simple').html('Empty'));
		
	};
	Playlist.prototype.addSong = function(songObj){
		var $song = $("<a></a>").html(songObj.path).data('id',songObj.id).data('added',songObj.added),
			$li = $("<li></li>").addClass('mp3').append($song);
		this.$this.append($li);
	};
	Playlist.prototype.nextSong = function(){
		this.$this.children(":first").remove();
		if ( this.$this.children().length == 0 )
			this.$this.append($('<li></li>').addClass('simple').html('Empty'));
	};
	Playlist.prototype.clear = function(){
		this.$this.empty();
		this.$this.append($('<li></li>').addClass('simple').html('Empty'));
	};

	// --------------------------------------------------------------------------------------
	// Current
	// --------------------------------------------------------------------------------------
	function NowListening( obj ) {
		this.$listening = obj.children('span.song');
		this.$status = obj.children('span.icons').children('span');
		this.icons = {
			"stop":"glyphicon-stop",
			"play":"glyphicon-play",
			"auto":"glyphicon-random",
			"end":"glyphicon-stop"
		};
	};
	NowListening.prototype.load = function(){
		var self = this;
		$.getJSON( '/api/current' , function(data){
			self.renderListening(data.listening);
			self.renderStatus(data.status);
		});
	};
	NowListening.prototype.renderListening = function(song){
		var agregar = ' - ';
		if ( ! $.isEmptyObject(song) ) agregar = song.path;
		this.$listening.html( agregar );
		playboard.reset();
	};
	NowListening.prototype.renderStatus = function(status){
		this.$status.attr('class','glyphicon').addClass(this.icons[status]);//glyphicon-play
	};
	NowListening.prototype.clear = function(){
		this.$status.attr('class','glyphicon').addClass(this.icons["stop"]);
		this.$listening.html(' - ');
	};

	var playlist = new Playlist( $("ul#playlist") ),
		current = new NowListening( $("#playingsong a") );

	// --------------------------------------------------------------------------------------
	// Chat
	// --------------------------------------------------------------------------------------
	function Chat( view , message , badge ) {
		this.$this = view;
		this.$message = message;
		this.$badge = badge;
		this.mensajes = 0;
		this.leidos = 0;
		this.max = 15;

		this.bindEvents();
	};
	Chat.prototype.send = function(txt){
		var self = this;
		$.post( '/chat' , {mensaje:txt} , function( data ) {
			data = JSON.parse(data);
			var exito = ErrorHandler.handle(data);
			if ( exito ) {
				self.$message.val('');
			}
			self.$message.prop('disabled', false);
		});
	};
	Chat.prototype.bindEvents = function(){
		var self = this;
		this.$message.bind('keypress', function(e) {
			var code = e.keyCode || e.which;
			if(code == 13) { //Enter keycode
				if ( self.$message.val() == '' ) return;
				self.$message.prop('disabled',true);
				self.send(self.$message.val());
			}
		});
	};
	Chat.prototype.addMessage = function(obj){
		if ( $li_active.data('dir') != 'chat' ) {
			if ( this.leidos > 9 ) {
				this.$badge.html('10+');
			} else {
				this.leidos++;
				this.$badge.html(this.leidos);
			}
		}

		this.mensajes++;
		var $msj = $('<li></li>').append( $('<b></b>').html(obj.user) ).append(obj.msj);
		this.$this.append($msj);

		if ( this.mensajes > this.max )
			this.$this.children('li:first-child').remove();
	};
	Chat.prototype.clear = function(){
		this.$this.empty();
	};

	var chat = new Chat($("ul#chat") , $("#tab_chat .chat-footer input") , $("ul.nav.masthead-nav span.badge"));

	// --------------------------------------------------------------------------------------
	// PlayBoard
	// --------------------------------------------------------------------------------------
	function PlayBoard( nextContainer ) {
		this.$next = nextContainer;
		this.onClickEvent();
	};

	PlayBoard.prototype.onClickEvent = function(){
		var self = this;
		this.$next.click( function(e){
			$.getJSON( '/api/votenext' , ErrorHandler.handle );
		});
	};

	PlayBoard.prototype.reset = function(){
		this.set('');
	};

	PlayBoard.prototype.set = function(num){
		this.$next.children('span.badge').html(num);
	};

	var playboard = new PlayBoard( $('a.voteNext') );

	// --------------------------------------------------------------------------------------
	// Usuarios
	// --------------------------------------------------------------------------------------
	function Usuarios( container ) {
		this.$this = container;
	};
	Usuarios.prototype.load = function(){
		var self = this;
		$.getJSON( '/users' , function(data){
			self.update(data);
		});
	};
	Usuarios.prototype.add = function(data){
		var $usr = $('<li></li>').html(data.name);
		this.$this.append($usr);
	};
	Usuarios.prototype.update = function(data){
		this.$this.empty();
		if ( data.length > 0 )
			for (var i = 0; i < data.length; i++) {
				this.add(data[i]);
			}
		else
			this.$this.append($('<li></li>').addClass('simple').html('Empty'));
	};
	var usuarios = new Usuarios( $("ul#users") );

	// --------------------------------------------------------------------------------------
	// Sockets
	// --------------------------------------------------------------------------------------
	var max_reconnects = 8,
		socket = io.connect(window.location.hostname , {"max reconnection attempts": max_reconnects });

	socket.on('playlist', function (data) {
		playlist.render(data);
	});
	socket.on('current', function (data) {
		current.renderListening(data);
		playlist.nextSong();
	});
	socket.on('chat', function (data) {
		chat.addMessage(data);
	});
	socket.on('users', function (data) {
		usuarios.update(data);
	});
	socket.on('state', function (data) {
		switch(data.state){
			case "off": Offline.popup(true); break;
			// Playing States:
			case "stop": current.renderStatus("stop"); break;
			case "play": current.renderStatus("play"); break;
			case "end": current.renderStatus("end"); break;
			case "auto": current.renderStatus("auto"); break;
			case "analyze": current.clear(); playlist.clear(); fSfiles.clear(); fSfolders.clear(); break;
			case "votenext": playboard.set(data.cant); break;
		}
	});
	// Connection events
	socket.on('connect', function () { Offline.clear(); start(); })
	socket.on('error', function () { if ( ! Offline.is() ) Offline.popup(); });
	//socket.on('disconnect', function () {}); // Instable: triggers when cliente refresh. Using State notice

	socket.on("reconnecting", function(delay, attempt) {
		if ( attempt === 0 && ! Offline.is() ) 
			Offline.popup();
		else if (attempt === max_reconnects) {
			Offline.giveUp();
		}
	});

	// Tabs:
	var $menu = $("ul.masthead-nav"),
		$list = $menu.children("li"),
		$li_active = $menu.find("li.active"),
		$tabs = $("#content"),
		$tab_active = $tabs.find(".active");

	$list.click(function(e){
		e.preventDefault();
		var $this = $(this);

		if ( ! $this.hasClass('active') ){
			$li_active.removeClass('active');
			$li_active = $this;
			$li_active.addClass('active');

			$tab_active.removeClass('active');
			$tab_active = $tabs.find("#tab_" + $this.data('dir'));
			$tab_active.addClass('active');

			if ( $this.data('dir') == 'chat')
				chat.leidos = 0;
				$this.find('span.badge').html('');
		}
	});

	// Ajax Error
	$( document ).ajaxError(function(){
		console.log("Ajax Error");
		Offline.popup();
	});

	var start = function(){
		usuarios.load();
		chat.clear();
		current.load();
		playlist.load();		
	};
	start();

});