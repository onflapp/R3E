(function (res, writer, context) {
  var map = context.makeContextMap(res);

  writer.start('application/json');
  writer.write(JSON.stringify(map, null, 2));
  writer.end();
});