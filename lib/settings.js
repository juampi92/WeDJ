// Settings:
var cfg_route = './settings/config.json',
	fs = require('fs');

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
			excludes: [],
			lastAnalyze: 0
		}
	};
}

config.save = function(libr){
	this.lib.folders = libr.folders;
	this.lib.excludes = libr.excludes;
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

module.exports = config;