(function (res, writer) {
	res.values['date'] = ''+new Date();
	writer.write(res);
	writer.end();
});
