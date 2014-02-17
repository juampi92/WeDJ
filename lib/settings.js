var cfg_route = './settings/config.json',
	fs = require('fs');

// Cargar
var existe = fs.existsSync(cfg_route);
if ( existe )
{
	config = JSON.parse(fs.readFileSync(cfg_route)); // OR require(cfg_route);
} else 
{
	fs.mkdirSync('./settings');
	config = {
		settings: {
			port: 3000
		},
		lib: {
			folders: [],
			excludes: []
		}
	};
}

config.save = function(){
	fs.writeFileSync(cfg_route,JSON.stringify(this));
}

module.exports = config;