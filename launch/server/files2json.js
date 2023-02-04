var r = require('../../dist/r3elib');

if (!process.argv[2]) {
  console.error('file2json [input file/dir]');
  process.exit(1);
}

var input = new r.FileResource(process.argv[2]);
var output = new r.ObjectResource({});
var root = new r.RootResource({
  'in': input,
  'out': output
});

var templates = new r.FileResource('./templates');

var rres = new r.ResourceResolver(root);
var tres = new r.ResourceResolver(templates);

var handler = new r.ResourceRequestHandler(rres, tres, {
  start: function () {},
  write: function (data) {
    //console.error(data);
  },
  error: function (err) {
    console.error(err);
  },
  end: function () {
    console.log(JSON.stringify(output.values));
    console.error('done');
  }
});

handler.registerFactory('js', new r.JSRendererFactory());
handler.handleStore('/in', {
  ':copyto': '/out'
});
