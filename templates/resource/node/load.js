(function (res, writer, context) {
  var rt = Utils.filename_dir(res.getRenderType());
  var dpath = context.getCurrentDataPath();
  var path = Utils.filename_path_append(rt, dpath);

  context.resolveTemplateResource(path, function (res) {
    if (res) {
      res.read(writer);
    }
    else {
      writer.start('text/html');
      writer.write('not found: ' + path);
      writer.end();
    }
  });
})
