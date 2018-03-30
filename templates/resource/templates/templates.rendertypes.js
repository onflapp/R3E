(function (res, writer, context) {
	writer.start('object/javascript');
	var paths = [];

	Tools.visitAllChidren(res, true, function(path, res) {
		if (path) {
			if (!res.isContentResource()) {
				paths.push(path.substr(1));
			}
		}
		else {
			writer.write(paths.sort());
			writer.end();
		}
	});

})
