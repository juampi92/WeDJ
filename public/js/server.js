var socket = io.connect('localhost', {
  "max reconnection attempts": 8
});

socket.on('current', function(data) {
  audio.changeSong();
});
socket.on('state', function(data) {
  console.log(data.state);
  switch (data.state) {
    case "off":
      // "Close window"
      audio.stop();
      break;
      // Playing States:
    case "stop":
      audio.stop();
      break;
    case "play":
      audio.play();
      break;
    case "end":
      audio.stop();
      break;
  }
});

var audio = {
  el: document.getElementById('audio'),
  init: function() {
    this.el.onended = this.ended.bind(this);
    this.changeSong();
  },
  changeSong: function() {
    this.el.src = "server/current/" + Math.trunc(Math.random() * 1000);
    this.el.play();
  },
  stop: function() {
    this.el.pause();
  },
  terminate: function() {

  },
  ended: function() {
    $.get('/server/next',function(data){
      console.log("Changing");
    });
  },
  play: function(){
    this.el.play();
  }
};

audio.init();