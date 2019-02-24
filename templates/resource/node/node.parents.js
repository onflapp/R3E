(function (res, writer, context) {
  writer.start('object/javascript');

  var path = context.getCurrentResourcePath();

  var parentPaths = [];
  var ps = Utils.split_path(path);
  ps.pop();

  while (ps.length > 0) {
    var rpath = ps.join('/');
    var name = ps.pop();
    var map = context.makeContextMap(res);

    if (name === '') continue;

    map['path'] = '/' + rpath;
    map['name'] = name;

    parentPaths.unshift(map);
  }

  writer.write(parentPaths);
  writer.end();

});
