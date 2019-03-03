(function (res, writer, context) {
  res.values['modified_date'] = '' + new Date();

  writer.write(res);
  writer.end();
});
