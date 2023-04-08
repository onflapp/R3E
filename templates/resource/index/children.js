(function (res, writer, context) {
  writer.start('object/javascript');
  var qp = context.getQueryProperties();
  var qry = '';

  if (qp && qp['q']) qry = qp['q'];
  if (!qry) {
    writer.write([]);
    writer.end();
    return;
  }

  context.currentResource.searchResources(qry, function (children) {
    var rv = [];

    for (var i = 0; i < children.length; i++) {
      var res = children[i];
      var map = {};

      map['name'] = res.getName();
      map['score'] = res.getProperty('score');
      map['ref'] = res.getProperty('reference');
      map['path'] = Utils.filename_path_append(context.getCurrentResourcePath(), name);

      rv.push(map);
    }

    writer.write(rv);
    writer.end();
  });
})
