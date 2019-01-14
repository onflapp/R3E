(function (res, writer) {
	res.values['date'] = ''+new Date();
	/*
	res.values = {
		':storeto':'/data/test',
		'name':'cool',
		'b.txt/_content':'text'
	};
	*/
	writer.write(res);
	writer.end();
});
