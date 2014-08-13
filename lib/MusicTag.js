module.exports = function(app) {

  var fs = require('fs'),
    mm = null;

  try {
    // If musicmetadata is installed:
    require.resolve("musicmetadata");
    mm = require('musicmetadata');
  } catch (e) {}

  /**
   * @class  MusicTag
   * @module MusicTag
   * @requires fs
   * @requires musicmetadata
   */
  var MusicTag = {
    /**
     * If the MusicTag is disabled (musicmetadata is not available)
     * @method disabled
     * @return {Boolean}
     */
    disabled: function() {
      return (mm == null);
    },
    /**
     * Given a song, get's it's metadata, and set's it's title and artist
     *   Uses musicmetadata.on('metadata')
     * @method analyze
     * @param  {Song} song
     * @param  {Function} callback Let let's now when it's done
     */
    analyze: function(song_path, callback) {
      if (mm == null) {
        callback(false);
        return;
      }

      var stream = fs.createReadStream(song_path);
      mm(stream).on('metadata', callback)
        .on('done', function(err) {
          if (err) console.log(err);
          stream.destroy();
        });
    },
    /**
     * Gets the song's picture, of available
     *   Uses musicmetadata.on('picture')
     * @method getPic
     * @param  {Object} song
     * @param  {Function} callback Params: picture
     */
    getPic: function(song, callback) {
      if (mm == null) {
        callback(false);
        return;
      }
      mm(fs.createReadStream(song.folder + '/' + song.path)).on('picture', function(result) {
        callback(result);
      }).on('done', function(err) {
        if (err) console.log(err);
      });
    }
  };

  //MusicTag.init();

  return MusicTag;
};