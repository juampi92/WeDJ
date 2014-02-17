
/*
 * GET users listing.
 */

exports.index = function(req, res){
  res.send("respond with a resource");
};

exports.nav = function(req, res){
	res.send(JSON.stringify(lib.navFolder("D:/Música")));
}