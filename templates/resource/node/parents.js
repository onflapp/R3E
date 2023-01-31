(async function (res, writer, ctx) {
  writer.start('object/javascript');

  let path = ctx.getCurrentResourcePath();

  let parentResources = [];
  let parentPaths = [];
  let ps = Utils.split_path(path);
  ps.pop();

  while (1) {
    let rpath = ps.join('/');
    if (rpath == '') break;
    
    let r = await ctx.resolveResource('/'+rpath);
    parentResources.unshift(r);

    ps.pop();
  }

  writer.write(parentResources);
  writer.end();
});
