(function (res, writer, context) {
  writer.start('object/javascript');
  var types = [];

  Tools.visitAllChidren(res, false, function (path, res) {
    if (path) {
      if (path.indexOf('.') > 0) {
        var name = Utils.filename(path);
        var dir = Utils.filename_dir(path).substr(1);
        if (!types.includes(dir)) types.push(dir);
      }
    }
    else {
      writer.write(types.sort());
      writer.end();
    }
  });

})
