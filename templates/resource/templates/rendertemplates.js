(async function (res, writer, ctx) {
  writer.start('object/javascript');
  
  /*
  let types = [];
  let currentRes = await ctx.resolveResource('.');

  Tools.visitAllChidren(currentRes, false, function (path, r) {
    if (path) {
      if (path.indexOf('.') > 0) {
        var name = Utils.filename(path);
        var dir = Utils.filename_dir(path).substr(1);
        if (!types.includes(dir)) types.push(dir);
      }
    }
    else {
      writer.write(types.sort());
      writer.end();
    }
  });
  */

  writer.end();
});
