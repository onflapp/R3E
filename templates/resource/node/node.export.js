(function (res, writer, context) {
	var count = 0;
	res.exportChilrenResources(0, {
		start:function(ctype) {
			writer.start('application/json');
			writer.write('[\n');
		},
		write:function(data) {
			if (count > 0) writer.write('\n,\n');
			writer.write(JSON.stringify(data));
			count++;
		},
		error:function(err) {
			console.log(err);
		},
		end:function() {
			writer.write('\n]');
			writer.end();
		}
	});
});
