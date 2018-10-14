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
dbx = new Dropbox.Dropbox({ accessToken:'heqNqEJNsg0AAAAAAAAHThZa890PtapTCQJPn6Dt-nqH41umubC5F3QuqKtR1iVY' });

p = new PouchDBResource(db);
b = new DropBoxResource(dbx);
d = new ObjectResource('data', data);
c = new ObjectResource('conf', config);

root = new RootResource({'data':d, 'conf':c, 'db':p, 'box':b});

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
