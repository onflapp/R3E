(function (res, writer, ctx) {
  var clientside = (typeof window != 'undefined');
  var xref = res['externalizedPath'];

  if (xref) {
    var url = escape(xref);
    writer.start('text/plain');
    writer.write(url);
    writer.end();
  }
  else if (clientside) {
    if (res['isContentResource']) {
      ctx.readResource('.', new ContentWriterAdapter('blob', function (data, ctype) {
        var blob = new Blob([data], {
          type: ctype ? ctype : 'application/octet-binary'
        });
        var url = URL.createObjectURL(blob);

        writer.start('text/plain');
        writer.write(url);
        writer.end();
      }));
    }
    else {
      writer.error(new Error('resource has no content'));
      writer.end();
    }
  }
  else {
    var url = ctx.pathInfo.resourcePath;
    writer.start('text/plain');
    writer.write(url);
    writer.end();
  }
});
