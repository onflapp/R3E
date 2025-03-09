(function (res, writer, ctx) {
  let path = ctx.getCurrentResourcePath();
  let rv = {};

  ctx.exportAllResources(path, 0, {
    start: function (ctype) {
    },
    write: function (data) {
      let p = data.values[':path'];
      let c = 0;
      for (let k in data.values) {
        if (k.charAt(0) == '_') continue;
        if (k.charAt(0) == ':') continue;

        let v = data.values[k];
        Utils.setObjectAtPath(rv, p+'/'+k, v);
        c++;
      }
      if (c == 0) {
        Utils.setObjectAtPath(rv, p, {});
      }
    },
    error: function (err) {
      console.log(err);
    },
    end: function () {
      let n = res['name'];
      writer.start('object/javascript');
      writer.write(rv[n]);
      writer.end();
    }
  }, true);
});
