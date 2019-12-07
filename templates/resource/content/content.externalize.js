(function (res, writer, context) {
  var clientside = (typeof window != 'undefined');
  var xref = res.getProperty('_xref');

  if (xref) {
    var url = escape(xref);
    writer.start('text/plain');
    writer.write(url);
    writer.end();
  }
  else if (clientside) {
    if (res.isContentResource()) {
      res.read(new ContentWriterAdapter('blob', function (data, ctype) {
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
    var url = context.pathInfo.resourcePath;
    writer.start('text/plain');
    writer.write(url);
    writer.end();
  }
});
