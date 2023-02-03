(async function (res, writer, ctx) {
  writer.start('object/javascript');
  
  let types = [];
  
  await ctx.listAllResourceNames('.', function (path) {
    if (path.indexOf('.') > 0) {
      let name = Utils.filename(path);
      let dir = Utils.filename_dir(path).substr(1);
      if (!types.includes(dir)) types.push(dir);
    }
  });

  writer.write(types.sort());
  writer.end();
});
