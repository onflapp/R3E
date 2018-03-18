var r = require('../../dist/r3elib');

root = new r.FileResource('..');
root.listChildrenNames(function(ls) {
	console.log(ls);
});

root.listChildrenResources(function(ls) {
	for (var i = 0; i < ls.length; i++) {
		var it = ls[i];
		console.log(it.getName());
	}
});

root.resolveChildResource('erver', function(res) {
	console.log(res.getName());
}, true);
