(function (res, writer, context) {
  var path = context.getCurrentDataPath();

  res.read(new ContentWriterAdapter('utf8', function (buff) {
    context.storeResource(path, {
      '_content':buff,
      ':import':path
    }, function() {
      writer.start('text/plain');
      writer.write('done');
      writer.end();
    });
  }));
});
