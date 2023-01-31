//clear the body to reduce flashing
document.body.innerHTML = '';

Utils.ENABLE_TRACE_LOG = 1;

//sample content as javascript object
var userContentVal = {
  'my simple web page': {
    _rt:'web/page',
    title: 'hello there'
  },
  'readme.txt': {
    _ct: 'text/plain',
    _content: 'this resource has editable text content'
  }
};

var userTemplateVal = {
  'web': {
    'page': {
      'default.hbs': {
        _content: '<h1>{{_.title}}</h1><p>this is very simple, non-HTML-compliant page</p>'
      }
    }
  }
};

function restoreLocalData() {
  try {
    //try restore data from the localStorage
    var data = localStorage.getItem('userContent');
    if (data) userContentVal = JSON.parse(data);

    data = localStorage.getItem('userTemplate');
    if (data) userTemplateVal = JSON.parse(data);
  }
  catch (ex) {
    console.log('unable to persist data in localStorage');
    console.log(ex);
  }
}

restoreLocalData();

//user content
var userContent = new ObjectResource(userContentVal);

//system templates loaded by <script> and exposed as window.templates
var systemTemplates = new ObjectResource(window.templates).wrap({
  getType: function() { return 'resource/templates'; }
});

//tempates for our own renderTypes
var userTemplate = new ObjectResource(userTemplateVal).wrap({
  getType: function() { return 'resource/templates'; }
});

var lunrIndex = new LunrIndexResource();

//default templates
var defaultTemplates = new ObjectResource({
  'resource': {
    'error': {
      'default.func': function (res, writer, ctx) {
        ctx.readResource('.', writer, null);
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
  'index': lunrIndex,
  'content': userContent,
  'system-templates': systemTemplates,
  'user-templates': userTemplate
});

var rres = new ResourceResolver(root);
var rtmp = new MultiResourceResolver([userTemplate, systemTemplates, defaultTemplates]);

var app_path = window.location.protocol + '//' + window.location.host + window.location.pathname + '#';

//configuration which is passed through context to the renderer, accessible as C.something
var config = {
  'X': '.x-',
  'APP_PREFIX':app_path,
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
handler.registerFactory('hbs', new HBSRendererFactory(), ['web']);
handler.registerFactory('js', new JSRendererFactory());
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

window.addEventListener('storage', function() {
  window.location.reload();
});

//start by listing content of the root resource
var path = location.hash.substr(1);
if (!path) path = '/.x-res-list';
handler.handleRequest(path);
