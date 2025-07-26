(function (res, writer, ctx) {
  writer.start('object/javascript');
  
  let rv = [];
  let names = Object.keys(res._);

  names.sort(function(a, b) {
    return a.localeCompare(b);
  });

  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    var val = res._[name];

    rv.push({
      key: name,
      value: val
    });
  }

  writer.write(rv);
  writer.end();
})
