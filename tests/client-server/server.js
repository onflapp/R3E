var PouchDB = require('pouchdb');
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

//start pouchdb database
db = PouchDB.defaults({prefix:'/tmp/'});
app.use('/db', require('express-pouchdb')(db, {
  mode: 'minimumForPouchDB'
}));
new db('contentdb');

//connect to the contentdb as client
db = new PouchDB('http://localhost:3000/db/contentdb');
var userContent = new r.PouchDBResource(db);

var userTemplate = new r.FileResource('./tests/templates').wrap({
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
  'P': '/server',
  'USER_TEMPLATES':'/user-templates',
  'BOOTSTRAP_CSS': 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css',
  'CODEMIRROR_JS': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/codemirror.min.js',
  'CODEMIRROR_CSS': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/codemirror.min.css',
  'CODEMIRROR_THEME': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/theme/solarized.min.css'
};

//handle all static local files for the client
app.use('/', express.static(__dirname));
app.use('/dist/', express.static(__dirname+'/../../dist'));

//handlers for GET and POST for express
app.get('/server/*', function (req, res) {
  var handler = new r.ServerRequestHandler(rres, rtmp, res);

  // [path].x-[selector].[selectorArgs][dataPath]
  // /cards/item1.x-json.-1.223/a/d
  handler.setPathContext('/server');
  handler.setPathParserPattern('^(\\/.*?)(\\.x-([a-z,\\-_]+))(\\.([a-z0-9,\\-\\.]+))?(\\/.*?)?$');
  handler.setConfigProperties(config);

  //registering renderers
  handler.registerFactory('js', new r.JSRendererFactory()); //javascript code which is going to be eval'd
  handler.registerFactory('hbs', new r.HBSRendererFactory()); //handlebar templates
  handler.registerFactory('func', new r.InterFuncRendererFactory()); //internal functions, usefull for function-based renderers

  handler.handleGetRequest(req);
});

app.post('/server/*', function (req, res) {
  var handler = new r.ServerRequestHandler(rres, rtmp, res);

  // [path].x-[selector].[selectorArgs][dataPath]
  // /cards/item1.x-json.-1.223/a/d
  handler.setPathContext('/server');
  handler.setPathParserPattern('^(\\/.*?)(\\.x-([a-z,\\-_]+))(\\.([a-z0-9,\\-\\.]+))?(\\/.*?)?$');
  handler.setConfigProperties(config);

  //registering renderers
  handler.registerFactory('js', new r.JSRendererFactory());
  handler.registerFactory('hbs', new r.HBSRendererFactory());
  handler.registerFactory('func', new r.InterFuncRendererFactory());

  handler.handlePostRequest(req);
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
