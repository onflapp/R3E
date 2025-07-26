document.body.innerHTML = '.';

Utils.ENABLE_TRACE_LOG = 0;
Utils.EXPORT_RENDER_CONTEXT = 1;

//sample content as javascript object
var userConfigVal = {
  'git_login': 'xxx'
};

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

//user content
var userContent = new LocalStorageResource(userContentVal, 'userContent');

//user config
var userConfig = new LocalStorageResource(userConfigVal, 'userconfig');

//user session
var userSession = new SessionStorageResource({}, 'usersession');

//system templates loaded by <script> and exposed as window.templates
var systemTemplates = new ObjectResource(window.templates).wrap({
  getType: function() { return 'resource/templates'; }
});

//tempates for our own renderTypes
var userTemplate = new LocalStorageResource(userTemplateVal, 'userTemplate').wrap({
  getType: function() { return 'resource/templates'; }
});

var lunrIndex = new LunrIndexResource();

//default templates
var defaultTemplates = new ObjectResource({
  'resource': {
    'error': {
      'default.func': function (res, writer, ctx) {
        writer.start('text/html');
        writer.write('<pre>'+res._['message']+'</pre>');
        writer.end();
      }
    },
    'root': {
      'default.func': function (res, writer, context) {
        //default is to take the existing resource path and render it as html
        context.forwardRequest(context.getCurrentResourcePath() + '.@res-list');
      }
    }
  }
});

//root resource can combine different resource together
//we are exposing systemTemplates and userTemplate so that templates become accessible
var root = new RootResource({
  'index': lunrIndex,
  'content': userContent,
  'config': userConfig,
  'session': userSession,
  'system-templates': systemTemplates,
  'user-templates': userTemplate
});

var rres = new ResourceResolver(root);
var rtmp = new MultiResourceResolver([userTemplate, systemTemplates, defaultTemplates]);

var app_path = window.location.protocol + '//' + window.location.host + window.location.pathname + '#';

//configuration which is passed through context to the renderer, accessible as C.something
var config = {
  'X': '.@',
  'APP_PREFIX':app_path,
  'USER_TEMPLATES':'/user-templates'
};

var handler = new ClientRequestHandler(rres, rtmp);

// [path].@[selector][dataPath]
// /cards/item1.@json/a/d
handler.setPathParserPattern('^(?<path>\\/.*?)(\\.@(?<selector>[a-z\\-_]+)(?<dataPath>\\/.*?)?)?$');
handler.setConfigProperties(config);

handler.registerValueTranformer('newUUID', function(data, key) {
  var lastid = Tools.makeID(userContent, 'LAST_ITEM_ID');
  var n = 'item';

  if (data && data['_rt'] && data['_rt'].length) {
    n = data['_rt'];
    n = Utils.expandValue(n, data);
    n = n.replaceAll('/', '_');
  }
  else if (data) {
    var z = '{'+key+'}/_rt';
    for (var k in data) {
      if (k.endsWith(z)) {
        n = data[k];
        n = Utils.expandValue(n, data);
        n = n.replaceAll('/', '_');
        break;
      }
    }
  }

  return n+'_'+lastid;
});

//register renderers
handler.registerFactory('hbs', new HBSRendererFactory());
handler.registerFactory('js', new JSRendererFactory());
handler.registerFactory('func', new InterFuncRendererFactory()); //internal functions, usefull for function-based renderers

window.addEventListener('storage', function(evt) {
  if (evt.key.charAt(0) != '_') {
    window.location.reload();
  }
});

handler.addEventListener('start', function() {
  document.body.style.transition = 'opacity 0.3s ease-in';
  document.body.style.opacity = '0';
});

handler.addEventListener('loaded', function() {
  document.body.style.opacity = '1';
});

//start by listing content of the root resource
var path = location.hash.substr(1);
if (!path) path = '/.@res-list';

handler.handleRequest(path);
