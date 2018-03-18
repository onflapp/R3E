var express = require('express');
var app = express();

var r = require('../../dist/r3elib');

root = new r.FileResource('.');
temps = new r.FileResource('./templates');

rres = new r.ResourceResolver(root);
rtmp = new r.MultiResourceResolver([temps]);

app.get('/*', function(req, res) {
	var handler = new r.ServerRequestHandler(rres, rtmp, res);
	handler.setEnvironment('BOOTSTRAP_CSS', '//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css');

	handler.registerFactory('js', new r.JSRendererFactory());
	handler.registerFactory('hbs', new r.HBSRendererFactory());

	handler.handleRequest(unescape(req.url));
});

app.post('/*', function(req, res) {
	var handler = new r.ServerRequestHandler(rres, rtmp, res);
	handler.setEnvironment('BOOTSTRAP_CSS', '//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css');

	handler.registerFactory('js', new r.JSRendererFactory());
	handler.registerFactory('hbs', new r.HBSRendererFactory());

	handler.handlePostRequest(req);
});


app.listen(3000, function() {
	console.log('Example app listening on port 3000!')
});
