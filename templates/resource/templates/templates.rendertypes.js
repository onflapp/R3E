(function (res, writer, context) {
  writer.start('object/javascript');
  var paths = [];

  Tools.visitAllChidren(res, false, function (path, res) {
    if (path) {
      if (res.isContentResource()) {
        var n = Utils.filename_dir(path).substr(1);
        if (!paths.includes(n)) paths.push(n);
      }
    }
    else {
      writer.write(paths.sort());
      writer.end();
    }
  });

})
