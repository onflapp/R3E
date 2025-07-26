(function (res, writer, ctx) {
  let tm = (new Date().getTime());

  if (!res['_cd']) res['_cd'] = '' + tm;
  res['_md'] = '' + tm;

  writer.write(res);
  writer.end();
});
