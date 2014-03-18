// Settings:
var cfg_route = './settings/config.json',
	fs = require('fs'),
	_ = require('underscore');

// Cargar
var existe = fs.existsSync(cfg_route);
if ( existe )
{
	config = JSON.parse(fs.readFileSync(cfg_route)); // OR require(cfg_route);
} else 
{
	if ( ! fs.existsSync('./settings') ) fs.mkdirSync('./settings');

	config = {
		settings: {
			port: 3000,
			lang: 'es'
		},
		lib: {
			folders: [],
			excluded: [],
			lastAnalyze: 0
		}
	};
}
if ( ! fs.existsSync('./settings/db') ) fs.mkdirSync('./settings/db');

config.save = function(){
	fs.writeFileSync(cfg_route,JSON.stringify(this));
}


config.setLang = function(str){
	config.settings.lang = str;
}
config.getLang = function(){
	return ( config.settings.lang == undefined ) ? 'es' : config.settings.lang;
}
config.setPort = function(str){
	config.settings.port = str;
}
config.setLastAnalyze = function(now){
	config.lib.lastAnalyze = now;
}

// Folders:
config.getFolders = function(){
	return config.lib.folders;
}

config.getExcluded = function(){
	return config.lib.excluded;
}

config.addFolder = function(folderArray){
	this.folders = _.union( this.folders , folderArray );
}

config.addExclude = function(folderArray) {
	this.excludes = _.union( this.excludes , folderArray );
};

config.rmFolder = function(folder){
	this.folders = _.without(this.folders, folder);
}

config.rmExclude = function(folder) {
	this.excludes = _.without(this.excludes, folder);
};

module.exports = config;