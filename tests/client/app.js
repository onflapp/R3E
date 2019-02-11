window.data = {
	a:{
		b:{
			_st:'/a/c',
			_rt:'/person',
			name:'Ondrej',
			last:'Florian'
		},
		c:{
			_rt:'/personB',
			name:'Sonja'
		}
	},
	'f.txt':{
		_ct:'text/plain',
		_content:'\n\nhello  '
	}
};

document.body.innerHTML = '';

//content resolver
var root = new ObjectResource('', window.data);
var rres = new ResourceResolver(root);

//template resolvers

//resource for default function-based renderers
var def = new ObjectResource('', {
	'resource': {
     'error': {
      	'default.func':function(res, writer, context) {
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
var temps = new ObjectResource('', window.templates);

//resolver will try the file-based renderers first and then fall-back on function-based ones
var rtmp = new MultiResourceResolver([temps, def]);

//configuration which is passed through context to the renderers
var config = {
	'BOOTSTRAP_CSS':'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css',
	'CODEMIRROR_JS':'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/codemirror.min.js',
	'CODEMIRROR_CSS':'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/codemirror.min.css',
	'CODEMIRROR_THEME':'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.43.0/theme/solarized.min.css'
};

var handler = new ClientRequestHandler(rres, rtmp);

handler.setConfigProperties(config);

//register renderers
handler.registerFactory('js', new JSRendererFactory());
handler.registerFactory('hbs', new HBSRendererFactory());
handler.registerFactory('func', new InterFuncRendererFactory());  //internal functions, usefull for function-based renderers

var path = location.hash.substr(1);
if (!path) path = '/.xres-list';
handler.handleRequest(path);
