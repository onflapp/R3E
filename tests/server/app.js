var express = require('express');
var app = express();

var r = require('../../dist/r3elib');

//content resolver
var root = new r.FileResource('./tests/content');
var rres = new r.ResourceResolver(root);

//template resolvers

//resource for default function-based renderers
var def = new r.ObjectResource('', {
	'resource': {
     'error': {
      	'default':function(res, writer, context) {
          res.read(writer, null);
        }
      }
    },
    'any': {
      'default.func':function(res, writer, context) {
				//default is to take the existing resource path and render it as html
	      context.forwardRequest(context.getCurrentResourcePath()+'.xres-list');
      }
    }
});

//resource for file-based renderers
var temps = new r.FileResource('./templates');

//resolver will try the file-based renderers first and then fall-back on function-based ones
var rtmp = new r.MultiResourceResolver([temps, def]);

//configuration which is passed through context to the renderers
var config = {
	'BOOTSTRAP_CSS':'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css',
	'CODEMIRROR_JS':'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/codemirror.min.js',
	'CODEMIRROR_CSS':'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/codemirror.min.css',
	'CODEMIRROR_THEME':'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/theme/solarized.min.css'
};

//handlers for GET and POST for express
app.get('/*', function(req, res) {
	var handler = new r.ServerRequestHandler(rres, rtmp, res);
	handler.setConfigProperties(config);

	//registering renderers
	handler.registerFactory('js', new r.JSRendererFactory());           //javascript code which is going to be eval'd
	handler.registerFactory('hbs', new r.HBSRendererFactory());         //handlebar templates
	handler.registerFactory('func', new r.InterFuncRendererFactory());  //internal functions, usefull for function-based renderers

	handler.handleGetRequest(req);
});

app.post('/*', function(req, res) {
	var handler = new r.ServerRequestHandler(rres, rtmp, res);
	handler.setConfigProperties(config);

	//registering renderers
	handler.registerFactory('js', new r.JSRendererFactory());
	handler.registerFactory('hbs', new r.HBSRendererFactory());
	handler.registerFactory('func', new r.InterFuncRendererFactory());

	handler.handlePostRequest(req);
});


app.listen(3000, function() {
	console.log('Example app listening on port 3000!')
});
