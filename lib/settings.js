var cfg_route = './settings/config.json',
	fs = require('fs');



// Cargar
if ( fs.existsSync(cfg_route) ){
	config = JSON.parse(fs.readFileSync(cfg_route)); // OR require(cfg_route);
} else {
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