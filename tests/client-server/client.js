//clear the body to reduce flashing
document.body.innerHTML = '';

var userTemplateVal = {
  'web': {
    'page': {
      'default.hbs': {
        _content: '<h1>{{_.title}}</h1><p>this is very simple, non-HTML-compliant page</p>'
      }
    }
  }
};

db = new PouchDB(window.location.protocol+'//'+window.location.host+'/db/contentdb');
//PouchDB.sync('mydb', 'http://localhost:5984/mydb');

var userContent = new PouchDBResource(db);

//system templates loaded by <script> and exposed as window.templates
var systemTemplates = new ObjectResource(window.templates).wrap({
  getType: function() { return 'resource/templates'; }
});

//tempates for our own renderTypes
var userTemplate = new ObjectResource(userTemplateVal).wrap({
  getType: function() { return 'resource/templates'; }
});

//default templates
var defaultTemplates = new ObjectResource({
  'resource': {
    'error': {
      'default.func': function (res, writer, context) {
        res.read(writer, null);
      }
    },
    'root': {
      'default.func': function (res, writer, context) {
        //default is to take the existing resource path and render it as html
        context.forwardRequest(context.getCurrentResourcePath() + '.x-res-list');
      }
    }
  }
});

//root resource can combine different resource together
//we are exposing systemTemplates and userTemplate so that templates become accessible
var root = new RootResource({
  'content': userContent,
  'system-templates': systemTemplates,
  'user-templates': userTemplate
});

var rres = new ResourceResolver(root);
var rtmp = new MultiResourceResolver([userTemplate, systemTemplates, defaultTemplates]);

//configuration which is passed through context to the renderer, accessible as C.something
var config = {
  'X': '.x-',
  'USER_TEMPLATES':'/user-templates',
  'BOOTSTRAP_CSS': 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css',
  'CODEMIRROR_JS': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/codemirror.min.js',
  'CODEMIRROR_CSS': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/codemirror.min.css',
  'CODEMIRROR_THEME': 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/theme/solarized.min.css'
};

var handler = new ClientRequestHandler(rres, rtmp);

// [path].x-[selector].[selectorArgs][dataPath]
// /cards/item1.x-json.-1.223/a/d
handler.setPathParserPattern('^(\\/.*?)(\\.x-([a-z,\\-_]+))(\\.([a-z0-9,\\-\\.]+))?(\\/.*?)?$');
handler.setConfigProperties(config);

//register renderers
handler.registerFactory('js', new JSRendererFactory());
handler.registerFactory('hbs', new HBSRendererFactory());
handler.registerFactory('func', new InterFuncRendererFactory()); //internal functions, usefull for function-based renderers

//persist data in localStorage
handler.addEventListener('stored', function(path, data) {
  try {
    localStorage.setItem('userTemplate', JSON.stringify(userTemplate.values));
    localStorage.setItem('userContent', JSON.stringify(userContent.values));
  }
  catch (ex) {
    console.log('unable to persist data in localStorage');
    console.log(ex);
  }
});

//start by listing content of the root resource
var path = location.hash.substr(1);
if (!path) path = '/.x-res-list';
handler.handleRequest(path);
