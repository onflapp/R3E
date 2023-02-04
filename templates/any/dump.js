(function (res, writer, ctx) {
  res['R'] = ctx.getRequestProperties();
  res['Q'] = ctx.getQueryProperties();
  res['C'] = ctx.getConfigProperties();

  writer.start('application/json');
  writer.write(JSON.stringify(res, null, 2));
  writer.end();
});
