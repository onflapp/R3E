(async function (res, writer, ctx) {
  writer.start('object/javascript');

  let children = await ctx.listResources('.');
  let rv = [];

  children.sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  writer.write(children);
})
