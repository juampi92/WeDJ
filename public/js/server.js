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