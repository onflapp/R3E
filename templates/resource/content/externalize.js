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
     if (typeof window['__path2url'] == 'undefined') window.__path2url = {};  

    if (res['isContentResource']) {
      var path = res['path'];
      var url = window.__path2url[path];
      if (url) {
        writer.start('text/plain');
        writer.write(url);
        writer.end();      
      }
      else {
        ctx.readResource('.', new ContentWriterAdapter('blob', function (data, ctype) {
          var blob = new Blob([data], {
            type: ctype ? ctype : 'application/octet-binary'
          });
          var url = URL.createObjectURL(blob);
          window.__path2url[path] = url;

          writer.start('text/plain');
          writer.write(url);
          writer.end();
        }));
      }
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
