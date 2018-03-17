(function (res, writer, context) {
	if (res.isContentResource()) {
		res.read(writer);
	}
	else {
		writer.error(new Error('resource has no content'));
		writer.end();
	}
});
