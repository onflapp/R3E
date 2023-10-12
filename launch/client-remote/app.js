//clear the body to reduce flashing
document.body.innerHTML = '';

Utils.ENABLE_TRACE_LOG = 1;

//user content
var userContent = new StoredObjectResource(new RemoteResource(), 'content.json');
userContent.setExternalizeContent(true);

//system templates loaded by <script> and exposed as window.templates
var systemTemplates = new ObjectResource(window.templates).wrap({
  getType: function() { return 'resource/templates'; }
});

//tempates for our own renderTypes
var userTemplate = new StoredObjectResource(new RemoteResource(), 'templates.json').wrap({
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
        context.forwardRequest(context.getCurrentResourcePath() + '@.res-list');
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
  'X': '.@',
  'APP_PREFIX':app_path,
  'USER_TEMPLATES':'/user-templates'
};

var handler = new ClientRequestHandler(rres, rtmp);

// [path].@[selector][dataPath]
// /cards/item1.@json/a/d
handler.setPathParserPattern('^(?<path>\\/.*?)(\\.@(?<selector>[a-z\\-_]+)(?<dataPath>\\/.*?)?)?$');
handler.setConfigProperties(config);

handler.registerValueTranformer('newUUID', function(data) {
  var lastid = Tools.makeID(userContent);
  var n = 'item';

  if (data && data['_rt'] && data['_rt'].length) {
    n = data['_rt'];
    n = Utils.expandValue(n, data);
    n = n.replaceAll('/', '_');
  }

  return n+'_'+lastid;
});

//register renderers
handler.registerFactory('hbs', new HBSRendererFactory());
handler.registerFactory('js', new JSRendererFactory());
handler.registerFactory('func', new InterFuncRendererFactory()); //internal functions, usefull for function-based renderers

//start by listing content of the root resource
var path = location.hash.substr(1);
if (!path) path = '/.@res-list';
handler.handleRequest(path);
