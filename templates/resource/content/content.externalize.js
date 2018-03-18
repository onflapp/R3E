(function (res, writer, context) {
	var clientside = (typeof window != 'undefined');

	if (clientside) {
		if (res.isContentResource()) {
			res.read(new ContentWriterAdapter('blob', function(data, ctype) {
				var blob = new Blob([data], {type:ctype?ctype:'application/octet-binary'});
				var url = URL.createObjectURL(blob);

				writer.start('text/plain');
				writer.write(url);
				writer.end();
			}));
		}
		else {
			writer.error(new Error('resource has no content'));
			writer.end();
		}
	}
	else {
		var url = context.pathInfo.path;
		writer.start('text/plain');
		writer.write(url);
		writer.end();
	}
});
