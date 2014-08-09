var socket = io.connect('localhost', {
  "max reconnection attempts": 8
});

socket.on('current', function(data) {
  console.log(data);
});
socket.on('state', function(data) {
  switch (data.state) {
    case "off":
      // "Close window"
      break;
      // Playing States:
    case "stop":
      console.log('Stop');
      break;
    case "play":
      console.log('play');
      break;
    case "end":
      console.log('end');
      break;
    case "auto":
      console.log('auto');
      break;
    case "analyze":
      console.log('analyze')
      break;
    case "votenext":
      console.log('votenext');
      break;
    case "autopilot_true":
      console.log('autopilot_true');
      break;
    case "autopilot_false":
      console.log('autopilot_true')
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

  },
  terminate: function() {

  },
  ended: function() {
    console.log("Ended");
  }
};

audio.init();