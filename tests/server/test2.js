var r = require('../../dist/r3elib');

root = new r.FileResource('.');
root.listChildrenNames(function(ls) {
	console.log(ls);
});

root.resolveChildResource('LICENSE', function(res) {
	if (res) {
		console.log(res.getName());
		res.read({
			write:function(data) {
				console.log(data);
			},
			end:function() {
			}
		});
	}
});
