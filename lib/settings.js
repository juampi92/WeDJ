// Settings:
var cfg_route = './settings/config.json',
  fs = require('fs'),
  _ = require('underscore');

// Cargar
var existe = fs.existsSync(cfg_route);
if (existe) {
  config = JSON.parse(fs.readFileSync(cfg_route)); // OR require(cfg_route);
} else {
  if (!fs.existsSync('./settings')) fs.mkdirSync('./settings');

  config = {
    settings: {
      port: 3000,
      lang: 'es',
      def_open: true
    },
    lib: {
      folders: [],
      excluded: [],
      lastAnalyze: 0
    }
  };
}
if (!fs.existsSync('./settings/db')) fs.mkdirSync('./settings/db');

config.save = function() {
  fs.writeFileSync(cfg_route, JSON.stringify(this));
}

config.setLang = function(str) {
  config.settings.lang = str;
}
config.getLang = function() {
  return (config.settings.lang == undefined) ? 'es' : config.settings.lang;
}
config.setPort = function(str) {
  config.settings.port = str;
}
config.setLastAnalyze = function(now) {
  config.lib.lastAnalyze = now;
}
config.getDefOpen = function() {
  return (config.settings.def_open || false);
}

// Folders:
config.getFolders = function() {
  return config.lib.folders;
}

config.getExcluded = function() {
  return config.lib.excluded;
}

config.addFolder = function(folderArray) {
  config.lib.folders = _.union(config.lib.folders, folderArray);
}

config.addExclude = function(folderArray) {
  config.lib.excludes = _.union(config.lib.excludes, folderArray);
};

config.rmFolder = function(folder) {
  config.lib.folders = _.without(config.lib.folders, folder);
}

config.rmExclude = function(folder) {
  config.lib.excludes = _.without(config.lib.excludes, folder);
};

module.exports = config;