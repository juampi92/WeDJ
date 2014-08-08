module.exports = function(app) {

  var autoUpdater = require('auto-updater')({
    async: false,
    autoupdate: true
  });

  /**
   * Auto Updater configuration
   */
  autoUpdater.on('check-up-to-date', function(v) {
    console.log(app.lang.trans("autoupdater.check_up_to_date", v));
  });
  autoUpdater.on('check-out-dated', function(v_old, v) {
    console.log(app.lang.trans("autoupdater.check_out_dated", v_old, v));
  });
  autoUpdater.on('update-downloaded', function() {
    console.log(app.lang.get("autoupdater.update_downloaded"));
  });
  autoUpdater.on('update-not-installed', function() {
    console.log(app.lang.get("autoupdater.update_not_installed"));
  });
  autoUpdater.on('extracted', function() {
    console.log(" > > ".bold.cyan + app.lang.get("autoupdater.extracted"));
  });
  autoUpdater.on('download-start', function(name) {
    console.log(" > ".bold.cyan + app.lang.trans("autoupdater.download_start", name));
  });
  autoUpdater.on('download-update', function(name, perc) {
    process.stdout.write(" > ".bold.cyan + app.lang.trans("autoupdater.download_update", perc) + " \033[0G");
  });
  autoUpdater.on('download-end', function(name) {
    console.log(" > ".bold.cyan + app.lang.trans("autoupdater.download_end", name));
  });
  autoUpdater.on('download-error', function(err) {
    console.log((app.lang.get("autoupdater.download_error")).red);
  });

  autoUpdater.forceCheck();

  return autoUpdater;
}