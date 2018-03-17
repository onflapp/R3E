(function (res, writer, context) {
	writer.start('object/javascript');
	var rv = [];

	var names = res.getPropertyNames();
  var env = context.getEnvironmentProperties();
  var props = context.getPathProperties();

	for (var i = 0; i < names.length; i++) {
		var name = names[i];
		var val = res.getProperty(name);

		rv.push({
			name:name,
			value:val,
			E:env,
			R:props
		});
	}

	writer.write(rv);
	writer.end();

})
