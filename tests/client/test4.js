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
		_content:'hello'
	}
};

window.config = {
	'BOOTSTRAP_CSS':'../static/bootstrap/css/bootstrap.min.css'
};

var r = localStorage.getItem('data');
if (r) window.data = JSON.parse(r);

db  = new PouchDB('dbtest');

//r = new RemoteResource('', 'http://localhost:1111/DB');
r = new RemoteResource('', '/tests/rem');
p = new PouchDBResource(db);
d = new ObjectResource('data', data);
c = new ObjectResource('conf', config);

root = new RootResource({'data':d, 'conf':c, 'db':p, 'rem':r});

rres = new ResourceResolver(root);
rtmp = new MultiResourceResolver([new SimpleRemoteResource('../../templates/'), new DefaultRenderingTemplates()]);

var requestHandler = new ClientRequestHandler(rres, rtmp);
requestHandler.addEventListener('stored', function(path, data) {
	localStorage.setItem('data', JSON.stringify(window.data))
});

requestHandler.setConfigProperties(config);
requestHandler.registerFactory('js', new JSRendererFactory());
requestHandler.registerFactory('hbs', new HBSRendererFactory());

var path = location.hash.substr(1);
if (!path) path = '/.xres-list';
requestHandler.handleRequest(path);
