(function (res, writer, context) {
  var adapter = new ContentWriterAdapter('utf8', function (txt) {
    writer.start('text/html');

    var md = null;
    var result = '';

    if (window && typeof window['markdownit'] !== 'undefined') {
      md = window.markdownit();
    }
    else {
      md = require('markdown-it')();
    }

    if (txt) result = md.render(txt);

    writer.write(result);
    writer.end();
  });

  res.read(adapter);
});
