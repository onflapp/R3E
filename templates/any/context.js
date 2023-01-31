(function (res, writer, ctx) {
  res['R'] = ctx['R'];
  res['Q'] = ctx['Q'];
  res['C'] = ctx['C'];

  writer.start('application/json');
  writer.write(JSON.stringify(res, null, 2));
  writer.end();
});
