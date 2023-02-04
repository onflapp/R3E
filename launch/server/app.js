var express = require('express');
var app = express();

var r = require('../../dist/r3elib');

//default templates
var defaultTemplates = new r.ObjectResource({
  'resource': {
    'error': {
      'default.func': function (res, writer, context) {
        res.read(writer, null);
      },
    },
    'root': {
      'default.func': function (res, writer, context) {
        //default is to take the existing resource path and render it as html
        context.forwardRequest(context.getCurrentResourcePath() + '.x-res-list');
      }
    }
  }
});

var userContent = new r.FileResource('./build/content');
var userTemplate = new r.FileResource('./build/templates').wrap({
  getType: function() { return 'resource/templates'; }
});

var systemTemplates = new r.FileResource('./templates').wrap({
  getType: function() { return 'resource/templates'; }
});

var root = new r.RootResource({
  'content': userContent,
  'system-templates': systemTemplates,
  'user-templates': userTemplate
});

var rres = new r.ResourceResolver(root);
var rtmp = new r.MultiResourceResolver([userTemplate, systemTemplates, defaultTemplates]);

//configuration which is passed through context to the renderers
var config = {
  'X': '.x-',
  'USER_TEMPLATES':'/user-templates',
};

//handlers for GET and POST for express
app.get('/*', function (req, res) {
  var handler = new r.ServerRequestHandler(rres, rtmp, res);

  // [path].x-[selector].[selectorArgs][dataPath]
  // /cards/item1.x-json.-1.223/a/d
  handler.setPathParserPattern('^(\\/.*?)(\\.x-([a-z,\\-_]+))(\\.([a-z0-9,\\-\\.]+))?(\\/.*?)?$');
  handler.setConfigProperties(config);

  //registering renderers
  handler.registerFactory('hbs', new r.HBSRendererFactory(), ['web']);
  handler.registerFactory('js', new r.JSRendererFactory()); //javascript code which is going to be eval'd
  handler.registerFactory('func', new r.InterFuncRendererFactory()); //internal functions, usefull for function-based renderers
  handler.handleGetRequest(req);
});

app.post('/*', function (req, res) {
  var handler = new r.ServerRequestHandler(rres, rtmp, res);

  // [path].x-[selector].[selectorArgs][dataPath]
  // /cards/item1.x-json.-1.223/a/d
  handler.setPathParserPattern('^(\\/.*?)(\\.x-([a-z,\\-_]+))(\\.([a-z0-9,\\-\\.]+))?(\\/.*?)?$');
  handler.setConfigProperties(config);

  //registering renderers
  var hbs = new r.HBSRendererFactory();
  handler.registerFactory('hbs', hbs, ['web']); //handlebar templates
  handler.registerFactory('js', new r.JSRendererFactory());
  handler.registerFactory('func', new r.InterFuncRendererFactory());

  handler.handlePostRequest(req);
});

//start the server and listen
app.listen(3000, function () {
  console.log('http://localhost:3000');
});
