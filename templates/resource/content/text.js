(function (res, writer, ctx) {
  if (res && res['isContentResource']) {
    ctx.readResource('.', new ContentWriterAdapter('utf8', function (data, ctype) {
      writer.start('text/plain');
      writer.write(data);
      writer.end();
    }));
  }
  else {
    writer.error(new Error('resource has no content'));
    writer.end();
  }
});
