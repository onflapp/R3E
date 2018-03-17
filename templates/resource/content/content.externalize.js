(function (res, writer, context) {
	if (res.isContentResource()) {
		res.read(new ContentWriterAdapter(function(data, ctype) {
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
});
