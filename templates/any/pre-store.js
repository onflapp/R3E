(function (res, writer, ctx) {
  res['_md'] = '' + (new Date().getTime());

  writer.write(res);
  writer.end();
});
