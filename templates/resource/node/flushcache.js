(function (res, writer, context) {
  writer.start('text/plain');

  if (res.flushResourceCache) {
    res.flushResourceCache();
    writer.write('DONE');
  }
  else {
    writer.write('NOT_SUPPORTED');
  }

  writer.end();
})
