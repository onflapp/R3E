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
		contentType:'text/plain',
		_content:'hello'
	}
};

var r = localStorage.getItem('data');
if (r) window.data = JSON.parse(r);


d = new ObjectResource('data', data);

root = new RootResource();
root.importData({ 'data':d });

rres = new ResourceResolver(root);
rtmp = new MultiResourceResolver([new AJAXResource('../templates/'), new DefaultRenderingTemplates()]);

var requestHandler = new ClientRequestHandler(rres, rtmp);
requestHandler.addEventListener('stored', function(path, data) {
	localStorage.setItem('data', JSON.stringify(window.data))
});

requestHandler.setEnvironment('BOOTSTRAP_CSS', '//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css');

requestHandler.registerFactory('js', new JSRendererFactory());
requestHandler.registerFactory('hbs', new HBSRendererFactory());

var path = location.hash.substr(1);
if (!path) path = '/.xres-list';
requestHandler.handleRequest(path);
