(function (res, writer, context) {
  writer.start('object/javascript');
  var qp = context.getQueryProperties();
  var qry = '';

  if (qp && qp['q']) qry = qp['q'];

  /*
  res.searchChildrenResources(qry, function (children) {
    var rv = [];

    for (var i = 0; i < children.length; i++) {
      var res = children[i];
      var map = context.makeContextMap(res);
      var name = res.getName();

      map['name'] = name;
      map['path'] = Utils.filename_path_append(context.getCurrentResourcePath(), name);

      rv.push(map);
    }

    writer.write(rv);
  });
  */
  writer.end();

})
