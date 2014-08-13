module.exports = function(app) {
  /**
   * Song class
   * @class Song
   * @module Song
   */
  function Song(json) {
    /**
     * @property _id
     * @type {Hash}
     */
    this._id = json._id;
    /**
     * @property title
     * @type {String}
     * @default '?'
     */
    this.title = json.title || '?';
    /**
     * @property artist
     * @type {String}
     * @default '?'
     */
    this.artist = json.artist || '?';
    /**
     * File name and extension
     * @property path
     * @type {String}
     */
    this.path = json.path;
    /**
     * Absolute folder path
     * @property folder
     * @type {String}
     */
    this.folder = json.folder;
    /**
     * @property played
     * @type {Number}
     * @default 0
     */
    this.played = json.played || 0;
    /**
     * ID of parent folder
     * @property parent_id
     * @type {Hash}
     */
    this.parent_id = json.parent_id;
    /**
     * @property added
     * @type {User}
     * @default null
     */
    this.added = json.added || null;
    /**
     * @property votes
     * @type {Object}
     */
    this.votes = {};
  }

  /**
   * Gets the song ID
   * @method getID
   * @return {Hash}
   */
  Song.prototype.getID = function() {
    return this._id;
  };

  /**
   * Tells if the Song has it's metadata fetched
   * @method hasMetadata
   * @return {Boolean}
   */
  Song.prototype.hasMetadata = function() {
    return (this.title !== '?');
  };

  /**
   * Concatenates folder with path to get the full path
   * @method getPath
   * @return {String}
   */
  Song.prototype.getPath = function() {
    return this.folder + '/' + this.path;
  };

  /**
   * Gets the User that added the song
   * @method getAdded
   * @return {User}
   */
  Song.prototype.getAdded = function() {
    return this.added;
  };

  /**
   * @method setAdded
   * @param  {User} user
   */
  Song.prototype.setAdded = function(user) {
    this.added = user;
  };

  /**
   * @method getTitle
   * @return {String}
   */
  Song.prototype.getTitle = function() {
    return this.title;
  };

  /**
   * @method setTitle
   * @param  {String} title
   */
  Song.prototype.setTitle = function(title) {
    this.title = title;
  };

  /**
   * @method getArtist
   * @return {String}
   */
  Song.prototype.getArtist = function() {
    return this.artist;
  };

  /**
   * @method setArtist
   * @param  {String} artist
   */
  Song.prototype.setArtist = function(artist) {
    this.artist = artist;
  };

  /**
   * Adds one to the times it was played, and saves it
   * @method addPlayed
   */
  Song.prototype.addPlayed = function() {
    this.played++;
    this.save();
  };

  /**
   * Loads MusicTags
   * @method loadTags
   * @param  {Function} callback [description]
   * @return {[type]} [description]
   */
  Song.prototype.loadTags = function(callback) {
    if (this.hasMetadata()) {
      callback();
      return;
    }
    var self = this;

    app.music_tag.analyze(this.getPath(), function(result) {
      self.setTitle(result.title);
      self.setArtist(result.artist[0]);
      self.save();
      if (callback) callback();
    });
  };

  /**
   * Adds one vote to the song, from that user
   * @method vote
   * @param  {User} user
   * @return {Boolean} Succeded
   */
  Song.prototype.vote = function(user) {
    if (this.votes[user.id]) return false;
    this.votes[user.id] = user;
    return true;
  };

  /**
   * Save song into DB
   * @method save
   * @param  {Function} callback Parameters: (err, numReplaced, newDoc)
   */
  Song.prototype.save = function(callback) {
    app.db.library.update({
      _id: this._id
    }, {
      $set: {
        title: this.title,
        artist: this.artist,
        played: this.played
      }
    }, {}, callback);
  };

  /**
   * Exports instance to JSON
   * @method toJSON
   * @return {JSON}
   */
  Song.prototype.toJSON = function() {
    return {
      id: this._id,
      title: this.title,
      artist: this.artist,
      path: this.path,
      user: this.added.toJSON()
    };
  };

  return Song;
};