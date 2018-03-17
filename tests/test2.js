var data = new ObjectResource('', {
	a:{
		b:{
			_rt:'/person',
			name:'Ondrej',
			last:'Florian',
			bbb: {
			},
			xxx: {
			}
		},
		c:{
			_rt:'/personB',
			name:'Sonja'
		}
	}
});

var templates = new ObjectResource('', {
	person: {
		'html.hbs':'a\n{{#children this}}\n-{{this}}\n{{/children}}\nb',
		html1: function(res, writer) {
			writer.start('xxx');
			writer.write('IN');
			writer.end();
		}
	},
	personB: {
		html1:function(res, writer) {
			writer.start('text/plain');
			writer.write('-1');
			writer.end();
		},
		html2:function(res, writer) {
			writer.start('text/plain');
			writer.write('-2 IN');

include('/a/b', 'html1', writer,10);

			writer.write('-2 OUT');
			writer.end();
		},
		html3:function(res, writer) {
			writer.start('text/plain');
			writer.write('-3');
			writer.end();
		}
	},
});

XC = 0;

rres = new ResourceResolver(data);

rtmpA = new ResourceResolver(templates);
rtmpB = new ResourceResolver(new AJAXResource('/tests/templates'));
rtmp = new MultiResourceResolver([rtmpA, rtmpB]);

rrend = new ResourceRenderer(rtmp);

out = new OrderedContentWriter({
	start:function() {
		document.open();
	},
	write:function(content) {
		document.write(content);
	},
	end:function() {
		console.log('END');
	}
});

rrend.registerFactory('js', new JSRendererFactory());
rrend.registerFactory('hbs', new HBSRendererFactory());
rrend.registerFactory('ejs', new EJSRendererFactory());

function include(path, sel, ww, ts) {
	var w = ww.makeNestedContentWriter();
	setTimeout(function() {
		rres.resolveResource(path, function(res) {
			if (res) {
				console.log(res);
				rrend.renderResource(res, res.getType(), sel, w);
			}
		});
	}, ts);
}

include('/a/b', 'html', out);
