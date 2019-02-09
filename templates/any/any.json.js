(function (res, writer) {
	writer.start('application/json');
	writer.write(JSON.stringify(res.getProperties()));
	writer.end();
});
