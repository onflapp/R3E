(function (res, writer, ctx) {
  var path = ctx.getCurrentDataPath();

  ctx.readResource('.', new ContentWriterAdapter('utf8', function (buff) {
    ctx.storeResource(path, {
      '_content':buff,
      ':import':path
    }, 
    function() {
      writer.start('text/plain');
      writer.write('done');
      writer.end();
    });
  }));
});
