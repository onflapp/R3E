(function (res, writer, context) {
	writer.start('object/javascript');

	var path = context.getCurrentResourcePath();
  var env = context.getEnvironmentProperties();
  var props = context.getRequestProperties();

	var parentPaths = [];
	var ps = Utils.split_path(path);
	ps.pop();

	while (ps.length > 0) {
		var rpath = ps.join('/');
		var name = ps.pop();

		if (name === '') continue;

		parentPaths.unshift({
			path:'/'+rpath,
			name:name,
			E:env,
			R:props
		});
	}

	writer.write(parentPaths);
	writer.end();

});
