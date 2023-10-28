(function (res, writer, ctx) {
  writer.start('object/javascript');
  var qp = ctx.getQueryProperties();
  var qry = '';

  if (qp && qp['q']) qry = qp['q'];
  if (!qry) {
    writer.write([]);
    writer.end();
    return;
  }

  ctx.searchResources('.', qry).then(function(ls) {
    var rv = [];
    for (var i = 0; i < ls.length; i++) {
      var it = ls[i];
      rv.push(it);
    } 
    writer.write(rv);
    writer.end();
  });
})
