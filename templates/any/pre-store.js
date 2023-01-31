(function (res, writer, ctx) {
  res['modified_date'] = '' + new Date();

  writer.write(res);
  writer.end();
});
