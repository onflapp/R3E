(function (res, writer, context) {
  writer.start('object/javascript');

  res.listChildrenResources(function (children) {
    var rv = [];
    children.sort(function(a, b) {
      return a.getName().localeCompare(b.getName());
    });

    for (var i = 0; i < children.length; i++) {
      var res = children[i];
      var map = context.makeContextMap(res);
      var name = res.getName();

      map['name'] = name;
      map['path'] = Utils.filename_path_append(context.getCurrentResourcePath(), name);

      rv.push(map);
    }

    writer.write(rv);
    writer.end();
  });

})
