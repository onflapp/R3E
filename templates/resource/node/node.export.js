(function (res, writer, context) {
	var processing = 0;
	var ended = false;
	var count = 0;
	var texttypes = ['application/json', 'application/javascript'];

	var export_content = function(data) {
		var func = data['_content'];
		var ct = data['_ct'];
		var bin = true;

		if (ct && (ct.indexOf('text/') === 0 || texttypes.indexOf(ct) !== 0)) bin = false;

		func(new ContentWriterAdapter(bin?null:'utf8', function(buff) {

			if (bin) {
				data['_ct'] = 'base64:' + (ct?ct:'');
				data['_content'] = Utils.ArrayBuffer2base64(buff);
			}
			else data['_content'] = buff;

			if (count > 0) writer.write('\n,\n');
			writer.write(JSON.stringify(data));
	
			processing--;
			done();
		}));
	};

	var done = function() {
		if (processing === 0 && ended) {
			writer.write('\n]');
			writer.end();
		}
	};

	res.exportChilrenResources(0, {
		start:function(ctype) {
			writer.start('application/json');
			writer.write('[\n');
		},
		write:function(data) {

			if (data['_content']) {
				processing++;
				export_content(data);
			}
			else {
				if (count > 0) writer.write('\n,\n');
				writer.write(JSON.stringify(data));
			}
			count++;
		},
		error:function(err) {
			console.log(err);
		},
		end:function() {
			ended = true;
			done();
		}
	});
});
