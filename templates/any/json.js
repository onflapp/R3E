(function (res, writer) {
  writer.start('application/json');
  writer.write(JSON.stringify(res, null, 2));
  writer.end();
});
