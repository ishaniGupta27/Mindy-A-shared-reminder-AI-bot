var clients = require('restify-clients');
var assert= require('assert');

var cl1 = clients.createJsonClient('http://127.0.0.1:3978');
cl1.post('/health_check_site', function(err,req,res){
	//assert.ifError(err);
	console.log('%s %d','Connected',res.statusCode);

});


