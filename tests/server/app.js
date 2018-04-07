var express = require('express');
var app = express();

var r = require('../../dist/r3elib');

root = new r.FileResource('./tests/content');
temps = new r.FileResource('./templates');

rres = new r.ResourceResolver(root);
rtmp = new r.MultiResourceResolver([temps]);

var config = {
	'BOOTSTRAP_CSS':'//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css'
};

app.get('/*', function(req, res) {
	var handler = new r.ServerRequestHandler(rres, rtmp, res);
	hander.setConfigProperties(config);

	handler.registerFactory('js', new r.JSRendererFactory());
	handler.registerFactory('hbs', new r.HBSRendererFactory());

	handler.handleGetRequest(req);
});

app.post('/*', function(req, res) {
	var handler = new r.ServerRequestHandler(rres, rtmp, res);
	hander.setConfigProperties(config);

	handler.registerFactory('js', new r.JSRendererFactory());
	handler.registerFactory('hbs', new r.HBSRendererFactory());

	handler.handlePostRequest(req);
});


app.listen(3000, function() {
	console.log('Example app listening on port 3000!')
});
