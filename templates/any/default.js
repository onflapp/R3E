(function (res, writer, ctx) {
  writer.start('text/html');

  writer.write('name:' + res.name);
  writer.write('<h1>render types:</h1>');
  writer.write('<ul>');

  var types = res.renderTypes;
  for (var i = 0; i < types.length; i++) {
    writer.write('<li>' + types[i] + '</li>');
  }
  writer.write('</ul>');

  writer.write('<h1>properties:</h1>');
  writer.write('<ul>');

  for (var name in res._) {
    var val = res._[name];
    writer.write('<li>' + name + '=' + val + '</li>');
  }

  writer.write('</ul>');

  var w = writer.makeNestedContentWriter();
  ctx.listResourceNames('.').then(function (children) {
    w.write('<h1>children:</h1>');
    w.write('<ul>');

    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      w.write('<li>' + child + '</a></li>');
    }
    w.write('</ul>');
    w.end();
  });

  writer.end();
})