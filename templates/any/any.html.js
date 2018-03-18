(function (res, writer, context) {
	writer.start('text/html');

	writer.write('name:'+res.getName());
	writer.write('<h1>render types:</h1>');
	writer.write('<ul>');

	var types = res.getRenderTypes();
	for (var i = 0; i < types.length; i++) {
		writer.write('<li>'+types[i]+'</li>');
	}
	writer.write('</ul>');


	writer.write('<h1>properties:</h1>');
	writer.write('<ul>');

	var names = res.getPropertyNames();
	for (var i = 0; i < names.length; i++) {
		var name = names[i];
		var val = res.getProperty(name);
		writer.write('<li>'+name+'='+val+'</li>');
	}

	writer.write('</ul>');

	var w = writer.makeNestedContentWriter();
	res.listChildrenNames(function(children) {
		w.write('<h1>children:</h1>');
		w.write('<ul>');
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			w.write('<li>'+child+'</a></li>');
		}
		w.write('</ul>');
		w.end();
	});

	writer.end();
})
