(function (res, writer) {
  res.values['modified_date'] = '' + new Date();

  writer.write(res);
  writer.end();
});
